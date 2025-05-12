
import React, { useRef, useEffect } from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';

const WaveVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData } = useVisualizer();
  
  useEffect(() => {
    if (!canvasRef.current || !audioData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const sliceWidth = canvas.width / audioData.length;
    const centerY = canvas.height / 2;
    
    // Create wave
    ctx.beginPath();
    
    // Top wave
    for (let i = 0; i < audioData.length; i++) {
      const x = i * sliceWidth;
      const amplitude = audioData[i] / 128.0;
      const y = centerY - (amplitude * centerY * 0.8);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    // Bottom wave (mirror)
    for (let i = audioData.length - 1; i >= 0; i--) {
      const x = i * sliceWidth;
      const amplitude = audioData[i] / 128.0;
      const y = centerY + (amplitude * centerY * 0.8);
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    
    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.8)');     // Blue top
    gradient.addColorStop(0.5, 'rgba(155, 89, 182, 0.6)');   // Purple middle
    gradient.addColorStop(1, 'rgba(231, 76, 60, 0.8)');      // Red bottom
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add a stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
  }, [audioData]);
  
  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  };
  
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default WaveVisualizer;
