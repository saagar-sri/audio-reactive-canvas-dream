
import React, { useRef, useEffect, useState } from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
}

const ParticlesVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioData } = useVisualizer();
  const particlesRef = useRef<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Initialize particles
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    setDimensions({ width: canvas.width, height: canvas.height });
    
    // Create particles
    const particles: Particle[] = [];
    const numParticles = 200;
    
    const colors = [
      '#3498db', // Blue
      '#2ecc71', // Green
      '#9b59b6', // Purple
      '#e74c3c', // Red
      '#f39c12'  // Orange
    ];
    
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 2 + 0.5,
        angle: Math.random() * Math.PI * 2
      });
    }
    
    particlesRef.current = particles;
  }, []);
  
  useEffect(() => {
    if (!canvasRef.current || !audioData || !dimensions.width) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear with a semi-transparent black to create trails
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get average audio level for reactivity
    const avg = audioData.reduce((a, b) => a + b, 0) / audioData.length;
    const reactivity = avg / 128; // Normalize to 0-1
    
    const particles = particlesRef.current;
    particles.forEach((p, index) => {
      // Update particle position based on audio
      const audioIndex = index % audioData.length;
      const audioValue = audioData[audioIndex] || 0;
      
      // Adjust size based on audio
      const size = p.size * (1 + (audioValue / 128) * 2);
      
      // Adjust speed based on audio
      const speed = p.speed * (1 + reactivity);
      
      // Move particle
      p.x += Math.cos(p.angle) * speed;
      p.y += Math.sin(p.angle) * speed;
      
      // Wrap around screen edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      // Random angle change for more organic movement
      if (Math.random() < 0.02) {
        p.angle += (Math.random() - 0.5) * Math.PI / 4;
      }
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      
      // Create gradient for glow effect
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    });
    
  }, [audioData, dimensions]);
  
  const handleResize = () => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
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

export default ParticlesVisualizer;
