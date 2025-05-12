
import React from 'react';
import { VisualizerProvider } from '@/contexts/VisualizerContext';
import Visualizer from '@/components/Visualizer';
import VisualizerControls from '@/components/VisualizerControls';
import { Toaster } from 'sonner';

const Index: React.FC = () => {
  return (
    <VisualizerProvider>
      <div className="min-h-screen bg-visualizer-bg overflow-hidden">
        <Visualizer />
        <VisualizerControls />
      </div>
      <Toaster position="top-center" />
    </VisualizerProvider>
  );
};

export default Index;
