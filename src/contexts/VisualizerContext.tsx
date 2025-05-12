
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type VisualizerType = 'bars' | 'circular' | 'wave' | 'particles';

interface VisualizerContextType {
  isPlaying: boolean;
  audioData: Uint8Array | null;
  visualizerType: VisualizerType;
  setVisualizerType: (type: VisualizerType) => void;
  startAudioCapture: () => Promise<void>;
  error: string | null;
}

const VisualizerContext = createContext<VisualizerContextType | undefined>(undefined);

export const VisualizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [visualizerType, setVisualizerType] = useState<VisualizerType>('bars');
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const startAudioCapture = async () => {
    try {
      setError(null);
      
      // Check if the browser supports getDisplayMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        const msg = "Your browser doesn't support system audio capture. Try using Chrome or Edge.";
        setError(msg);
        toast.error(msg);
        return;
      }

      // Cleanup any previous audio setup
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Create new audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      console.log("Requesting display media with audio...");
      toast.info("Please select 'Share system audio' in the prompt");
      
      // Request system audio capture
      try {
        // Use getDisplayMedia to capture screen with audio
        streamRef.current = await navigator.mediaDevices.getDisplayMedia({ 
          video: { 
            displaySurface: "monitor",
          }, 
          audio: true
        });
        
        console.log("Stream obtained:", streamRef.current);
        console.log("Audio tracks:", streamRef.current.getAudioTracks().length);
        
        // Check if we have audio tracks
        if (streamRef.current.getAudioTracks().length === 0) {
          const msg = "No audio track detected. Please make sure to select 'Share audio' when prompted.";
          setError(msg);
          toast.warning(msg);
          
          // Stop video tracks
          streamRef.current.getVideoTracks().forEach(track => track.stop());
          return;
        }
        
        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        // Connect the media stream to the audio context
        sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
        
        // Only connect to analyser, not to the destination (prevents double audio)
        sourceRef.current.connect(analyserRef.current);
        
        // Remove this line to prevent double audio:
        // analyserRef.current.connect(audioContextRef.current.destination);
        
        console.log("Audio pipeline connected successfully");
        setIsPlaying(true);
        toast.success("System audio capture started");
        
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
        console.error("Error accessing system audio:", error);
        const msg = "Could not access system audio. Please ensure you select 'Share audio' when prompted.";
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error setting up audio:", error);
      const msg = "Could not access system audio. This might not be supported in your browser.";
      setError(msg);
      toast.error(msg);
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
        audioContextRef.current.close().catch(console.error);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const value = {
    isPlaying,
    audioData,
    visualizerType,
    setVisualizerType,
    startAudioCapture,
    error,
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
