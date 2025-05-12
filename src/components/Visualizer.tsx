
import React from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';
import BarsVisualizer from '@/components/visualizers/BarsVisualizer';
import CircularVisualizer from '@/components/visualizers/CircularVisualizer';
import WaveVisualizer from '@/components/visualizers/WaveVisualizer';
import ParticlesVisualizer from '@/components/visualizers/ParticlesVisualizer';

const Visualizer: React.FC = () => {
  const { isPlaying, visualizerType, startAudioCapture } = useVisualizer();
  
  const handleStartClick = () => {
    startAudioCapture();
  };
  
  return (
    <div className="visualizer-container">
      {/* Render the active visualizer */}
      {isPlaying && (
        <>
          {visualizerType === 'bars' && <BarsVisualizer />}
          {visualizerType === 'circular' && <CircularVisualizer />}
          {visualizerType === 'wave' && <WaveVisualizer />}
          {visualizerType === 'particles' && <ParticlesVisualizer />}
        </>
      )}
      
      {/* Start button that's shown if audio is not yet playing */}
      {!isPlaying && (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold mb-6 text-white">Audio Visualizer</h1>
          <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
            Click the button below to visualize system audio. You'll need to select "Share system audio" when prompted.
          </p>
          <button
            onClick={handleStartClick}
            className="px-6 py-3 bg-visualizer-primary text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
          >
            Start Visualizer
          </button>
        </div>
      )}
    </div>
  );
};

export default Visualizer;
