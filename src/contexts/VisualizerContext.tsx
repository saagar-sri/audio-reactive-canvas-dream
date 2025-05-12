
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
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startAudioCapture = async () => {
    try {
      setError(null);
      
      // Check if the browser supports getDisplayMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setError("Your browser doesn't support system audio capture. Try using Chrome or Edge.");
        toast.error("Your browser doesn't support system audio capture");
        return;
      }

      if (!audioContextRef.current) {
        // Create audio context with a user gesture
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume audio context if it's suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      }

      // Create an audio element to receive system audio via a user gesture
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
        audioElementRef.current.autoplay = true;
      }

      // Request system audio capture
      try {
        console.log("Requesting display media with audio...");
        toast.info("Please select 'Share system audio' in the prompt");
        
        // Use getDisplayMedia to capture screen with audio
        // Removed 'cursor' property as it's not a valid MediaTrackConstraints property
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { 
            displaySurface: "monitor",
          }, 
          audio: true
        });
        
        console.log("Stream obtained:", stream);
        console.log("Audio tracks:", stream.getAudioTracks().length);
        
        // Extract the audio track
        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) {
          // If no audio track is available, show a warning
          const msg = "No audio track detected. Please select a source with audio and enable 'Share audio'";
          setError(msg);
          toast.warning(msg);
          
          // Stop video tracks that might have been created
          stream.getVideoTracks().forEach(track => track.stop());
          
          // Return early as we don't have audio
          return;
        }
        
        // Create a new MediaStream with only the audio track
        const audioStream = new MediaStream([audioTrack]);
        
        // Connect the audio stream to the audio element
        audioElementRef.current.srcObject = audioStream;
        
        // Stop video tracks as we only need audio
        stream.getVideoTracks().forEach(track => track.stop());
        
        console.log("Audio stream connected to audio element");
      } catch (error) {
        console.error("Error accessing system audio:", error);
        const msg = "Could not access system audio. Please ensure you select 'Share audio' when prompted.";
        setError(msg);
        toast.error(msg);
        return;
      }

      // Create analyser node
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 512;
        
        // Create data array for frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      }

      // Connect audio element to audio context
      try {
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        
        // Wait for the audio element to be properly initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElementRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        console.log("Audio pipeline connected successfully");
      } catch (error) {
        console.error("Error connecting audio pipeline:", error);
        const msg = "Error setting up audio processing. Please try again.";
        setError(msg);
        toast.error(msg);
        return;
      }
      
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
        audioContextRef.current.close();
      }
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
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
