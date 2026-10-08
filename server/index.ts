import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const rawKey = process.env.GEMINI_API_KEY || '';
const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();
process.env.GEMINI_API_KEY = apiKey;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is missing in .env.");
} else if (apiKey === "your_key_here" || apiKey === "dummy_key_for_testing" || apiKey === "your_actual_key_here") {
  console.warn("WARNING: GEMINI_API_KEY is set to a placeholder value.");
} else {
  console.log(`API key loaded. Prefix: ${apiKey.substring(0, 4)}, Length: ${apiKey.length}`);
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const upload = multer({ storage: multer.memoryStorage() });

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function executeGeminiWithRetry(contents: any[], filePart: any, systemInstruction: string, isStream: boolean) {
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const fallbackModelsStr = process.env.GEMINI_FALLBACK_MODELS || "";
  const fallbackModels = fallbackModelsStr.split(",").map(m => m.trim()).filter(Boolean);
  const allModels = [primaryModel, ...fallbackModels];
  const delays = [1000, 2000, 4000];

  for (const modelName of allModels) {
    if (filePart && modelName === "gemini-pro") {
      console.log(`Skipping ${modelName} as it does not support image input.`);
      continue;
    }

    const modelOptions: any = { model: modelName };
    if (systemInstruction) {
      modelOptions.systemInstruction = systemInstruction;
    }
    const model = genAI.getGenerativeModel(modelOptions);
    let success = false;
    let finalResponse = null;

    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        if (isStream) {
          finalResponse = await model.generateContentStream({ contents });
        } else {
          finalResponse = await model.generateContent({ contents });
        }
        console.log(`Successfully answered by model: ${modelName}`);
        return finalResponse; // Return stream or response object
      } catch (error: any) {
        const status = error.status;
        const isRetryable = status === 503 || status === 429 || status === 500 || error.message?.includes('503') || error.message?.includes('429');
        
        if (isRetryable && attempt < 3) {
          const jitter = Math.random() * 500;
          const waitTime = delays[attempt] + jitter;
          console.warn(`[${modelName}] Attempt ${attempt + 1} failed (Status: ${status || 'unknown'}). Retrying in ${Math.round(waitTime)}ms...`);
          await sleep(waitTime);
        } else {
          console.error(`[${modelName}] Failed after ${attempt + 1} attempts or non-retryable error (Status: ${status || 'unknown'}).`);
          break; // Move to next model
        }
      }
    }
  }

  throw new Error("All models failed due to high demand or errors.");
}

async function handleChat(req: any, res: any, isStream: boolean) {
  try {
    const { message, history, systemInstruction } = req.body;
    let filePart = null;

    if (req.file) {
      filePart = {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      };
    } else if (req.body.image) {
      const match = req.body.image.match(/^data:(image\/\w+);base64,(.*)$/);
      if (match) {
        filePart = {
          inlineData: { data: match[2], mimeType: match[1] }
        };
      }
    }

    let parsedHistory = [];
    if (history) {
      try {
        parsedHistory = JSON.parse(history);
      } catch (e) {
        parsedHistory = history;
      }
    }

    const contents: any[] = [];
    if (Array.isArray(parsedHistory)) {
      for (const msg of parsedHistory) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const currentParts: any[] = [];
    if (message) {
      currentParts.push({ text: message });
    }
    if (filePart) {
      currentParts.push(filePart);
    }

    if (currentParts.length > 0) {
      contents.push({ role: 'user', parts: currentParts });
    }

    const result: any = await executeGeminiWithRetry(contents, filePart, systemInstruction, isStream);

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
      } catch (streamError) {
        console.error('Error during streaming:', streamError);
        res.write(`data: ${JSON.stringify({ error: 'Streaming interrupted' })}\n\n`);
      } finally {
        res.end();
      }
    } else {
      res.json({ reply: result.response.text() });
    }

  } catch (error: any) {
    console.error('Error in chat API:', error.message || error);
    let errorMsg = 'Failed to generate response. Please try again.';
    let statusCode = 500;

    if (error.status === 400 || error.message?.includes('API key not valid')) {
      errorMsg = 'API key missing or invalid. Please check your GEMINI_API_KEY.';
      statusCode = 400;
    } else if (error.message?.includes('high demand') || error.message?.includes('All models failed')) {
      errorMsg = 'The AI is very busy right now. Please try again in a moment.';
      statusCode = 503;
    } else if (error.message) {
      errorMsg = 'The AI is very busy right now. Please try again in a moment.';
      statusCode = 503;
    }

    if (isStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
    } else {
      res.status(statusCode).json({ error: errorMsg });
    }
  }
}

app.post('/api/chat', upload.single('image'), (req, res) => handleChat(req, res, false));
app.post('/api/chat/stream', upload.single('image'), (req, res) => handleChat(req, res, true));

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on('error', (e: NodeJS.ErrnoException) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Error: Port ${port} is already in use. Please kill the process using this port and try again.`);
    process.exit(1);
  } else {
    console.error('Server error:', e);
  }
});
