
import React from 'react';
import { useVisualizer, type VisualizerType } from '@/contexts/VisualizerContext';
import { Button } from '@/components/ui/button';

const VisualizerControls: React.FC = () => {
  const { visualizerType, setVisualizerType, isPlaying } = useVisualizer();
  
  const visualizerOptions: { type: VisualizerType; label: string }[] = [
    { type: 'bars', label: 'Bars' },
    { type: 'circular', label: 'Circular' },
    { type: 'wave', label: 'Wave' },
    { type: 'particles', label: 'Particles' }
  ];
  
  if (!isPlaying) return null;
  
  return (
    <div className="visualizer-overlay bg-black/30 backdrop-blur-sm p-3 rounded-full">
      <div className="flex space-x-2">
        {visualizerOptions.map(option => (
          <Button
            key={option.type}
            variant={visualizerType === option.type ? "default" : "outline"}
            size="sm"
            onClick={() => setVisualizerType(option.type)}
            className={
              visualizerType === option.type 
                ? 'bg-visualizer-primary hover:bg-visualizer-primary/90' 
                : 'bg-transparent text-white hover:bg-white/10'
            }
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VisualizerControls;
