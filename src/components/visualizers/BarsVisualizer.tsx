
import React, { useRef, useEffect } from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';

const BarsVisualizer: React.FC = () => {
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
    
    // Calculate bar width based on number of data points
    const barWidth = Math.max(2, canvas.width / audioData.length);
    const centerY = canvas.height / 2;
    
    // Draw bars
    for (let i = 0; i < audioData.length; i++) {
      const barHeight = audioData[i] * 1.5;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      gradient.addColorStop(0, '#3498db'); // Blue
      gradient.addColorStop(0.5, '#9b59b6'); // Purple
      gradient.addColorStop(1, '#e74c3c'); // Red
      
      ctx.fillStyle = gradient;
      
      // Draw top bar (mirror)
      ctx.fillRect(i * barWidth, centerY - barHeight, barWidth - 1, barHeight);
      
      // Draw bottom bar (mirror)
      ctx.fillRect(i * barWidth, centerY, barWidth - 1, barHeight);
    }
    
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

export default BarsVisualizer;
