import React, { useRef, useState, useEffect } from 'react';
import { X, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onCapture: (imageStr: string) => void;
  onClose: () => void;
}

export default function CameraPreview({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera.');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImg(dataUrl);
      }
    }
  };

  const retake = () => {
    setCapturedImg(null);
  };

  const confirm = () => {
    if (capturedImg) {
      onCapture(capturedImg);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-4 overflow-hidden backdrop-blur-md"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-md aspect-[3/4] bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/20">
        {!capturedImg ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={capturedImg} alt="Captured" className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        {!capturedImg ? (
          <button 
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full btn-primary"></div>
          </button>
        ) : (
          <>
            <button 
              onClick={retake}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={20} />
              <span>Retake</span>
            </button>
            <button 
              onClick={confirm}
              className="flex items-center gap-2 px-6 py-3 rounded-full btn-primary shadow-lg"
            >
              <Check size={20} />
              <span>Use Photo</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
