# KSAM Assistant

A modern, highly dynamic single-page chat web app built with React, Vite, Tailwind CSS, Framer Motion, and the Gemini API.

## Features
- Real-time chat interface with markdown support and typing indicators.
- Voice conversation (Speech-to-text input and text-to-speech reading).
- Photo capture via device camera or file upload.
- Vision AI model integration for image analysis and suggestions.
- Context-aware quick-reply chips.
- Stunning Glassmorphism design with animated gradient mesh background.
- Fully responsive and supports Light/Dark mode.

## Getting Started

1. **Environment Variables**
   Create a `.env` file in the `server` directory and add your Gemini API key. 
   You can get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
   
   ```env
   # server/.env
   GEMINI_API_KEY=your_actual_key_here
   GEMINI_MODEL=gemini-3.8-flash
   GEMINI_FALLBACK_MODELS=gemini-3.8-flash-lite,gemini-2.5-flash
   PORT=3001
   ```

2. **Install Dependencies**
   From the root folder, run:
   ```bash
   npm run install:all
   ```

3. **Run the App**
   To start both the backend server and the frontend client concurrently, run:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`.
