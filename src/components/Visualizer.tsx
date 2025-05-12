
import React from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';
import BarsVisualizer from '@/components/visualizers/BarsVisualizer';
import CircularVisualizer from '@/components/visualizers/CircularVisualizer';
import WaveVisualizer from '@/components/visualizers/WaveVisualizer';
import ParticlesVisualizer from '@/components/visualizers/ParticlesVisualizer';
import { AlertTriangle, Volume2 } from 'lucide-react';

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
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 max-w-md text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="text-red-500 mr-2" />
                <h3 className="text-red-500 font-semibold">Error</h3>
              </div>
              <p className="text-white">{error}</p>
            </div>
          ) : null}
          
          <div className="text-lg text-gray-300 mb-8 max-w-md text-center space-y-4">
            <p>
              Click the button below to visualize system audio.
            </p>
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
              <p className="font-semibold mb-2 flex items-center justify-center">
                <Volume2 className="mr-2" /> Important Instructions:
              </p>
              <ul className="list-disc list-inside text-sm text-left">
                <li>When prompted, select a screen or window to share</li>
                <li>Make sure to check "Share system audio" option (critical)</li>
                <li>Works best with Chrome or Edge browsers</li>
                <li>Play music or audio from any source on your device</li>
              </ul>
            </div>
          </div>
          
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
