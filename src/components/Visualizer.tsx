
import React from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';
import BarsVisualizer from '@/components/visualizers/BarsVisualizer';
import CircularVisualizer from '@/components/visualizers/CircularVisualizer';
import WaveVisualizer from '@/components/visualizers/WaveVisualizer';
import ParticlesVisualizer from '@/components/visualizers/ParticlesVisualizer';
import { AlertTriangle } from 'lucide-react';

const Visualizer: React.FC = () => {
  const { isPlaying, visualizerType, startAudioCapture, error } = useVisualizer();
  
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
      
      {/* Start screen with error handling */}
      {!isPlaying && (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold mb-6 text-white">Audio Visualizer</h1>
          
          {error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 max-w-md">
              <div className="flex items-center mb-2">
                <AlertTriangle className="text-red-500 mr-2" />
                <h3 className="text-red-500 font-semibold">Error</h3>
              </div>
              <p className="text-white">{error}</p>
            </div>
          ) : null}
          
          <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
            Click the button below to visualize system audio. You'll need to select "Share system audio" when prompted.
          </p>
          
          <button
            onClick={handleStartClick}
            className="px-6 py-3 bg-visualizer-primary text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
          >
            Start Visualizer
          </button>
          
          <div className="mt-8 text-gray-400 text-sm max-w-md text-center">
            <p>Best used with Chrome or Edge browsers.</p>
            <p className="mt-2">Make sure to select a tab or window that has audio playing, and check the "Share audio" option.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizer;
