
import React, { useRef, useEffect } from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';

const CircularVisualizer: React.FC = () => {
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
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Size of the circle based on minimum of canvas width and height
    const circleRadius = Math.min(canvas.width, canvas.height) / 4;
    
    // Number of points to draw around the circle
    const numOfPoints = 128; // Using a subset of the audio data
    const angleStep = (2 * Math.PI) / numOfPoints;
    
    // Draw circles
    for (let j = 0; j < 3; j++) { // Draw 3 layers
      const radiusMultiplier = 1 + (j * 0.5);
      const baseRadius = circleRadius * radiusMultiplier;
      
      ctx.beginPath();
      
      for (let i = 0; i < numOfPoints; i++) {
        const angle = i * angleStep;
        const dataIndex = Math.floor(i * audioData.length / numOfPoints);
        const value = audioData[dataIndex] || 0;
        
        // Scale the value for visual appeal
        const radiusOffset = value * 0.5;
        const radius = baseRadius + radiusOffset;
        
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Close the path
      ctx.closePath();
      
      // Define colors based on layer
      let color;
      if (j === 0) color = 'rgba(52, 152, 219, 0.5)'; // Blue
      else if (j === 1) color = 'rgba(155, 89, 182, 0.5)'; // Purple
      else color = 'rgba(231, 76, 60, 0.5)'; // Red
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Light fill
      ctx.fillStyle = color.replace('0.5', '0.2');
      ctx.fill();
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

export default CircularVisualizer;
