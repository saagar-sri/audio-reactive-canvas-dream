
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type VisualizerType = 'bars' | 'circular' | 'wave' | 'particles';

interface VisualizerContextType {
  isPlaying: boolean;
  audioData: Uint8Array | null;
  visualizerType: VisualizerType;
  setVisualizerType: (type: VisualizerType) => void;
  startAudioCapture: () => Promise<void>;
}

const VisualizerContext = createContext<VisualizerContextType | undefined>(undefined);

export const VisualizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('bars');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const startAudioCapture = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Get user media - this will prompt for audio access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create analyser node
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        
        // Create data array for frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      }

      // Connect stream to audio context
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      setIsPlaying(true);
      toast.success("Audio capture started");
      
      // Start animation frame to continuously get audio data
      const updateAudioData = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          setAudioData(new Uint8Array(dataArrayRef.current));
        }
        animationRef.current = requestAnimationFrame(updateAudioData);
      };
      
      updateAudioData();
    } catch (error) {
      console.error("Error accessing audio:", error);
      toast.error("Could not access microphone. Please grant permission to use the audio visualizer.");
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const value = {
    isPlaying,
    audioData,
    visualizerType,
    setVisualizerType,
    startAudioCapture,
  };

  return (
    <VisualizerContext.Provider value={value}>
      {children}
    </VisualizerContext.Provider>
  );
};

export const useVisualizer = (): VisualizerContextType => {
  const context = useContext(VisualizerContext);
  if (context === undefined) {
    throw new Error('useVisualizer must be used within a VisualizerProvider');
  }
  return context;
};
