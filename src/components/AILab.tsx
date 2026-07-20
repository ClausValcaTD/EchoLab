import { useRef, useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Scissors, RotateCcw, Activity, Undo2, Redo2, Loader2, Music, Download } from 'lucide-react';
import { toast } from 'sonner';

export function AILab() {
  const { 
    isLoaded, 
    engine, 
    analyzeLoudness, 
    loudnessData, 
    autoMaster, 
    detectBPM, 
    bpm,
    separateStems,
    addMixerTrack
  } = useAudio();

  const [isSeparating, setIsSeparating] = useState(false);
  const [stems, setStems] = useState<{vocals?: AudioBuffer, drums?: AudioBuffer, bass?: AudioBuffer, other?: AudioBuffer}>({});

  const handleSeparate = async () => {
    if (!engine.buffer) return;
    setIsSeparating(true);
    toast('Separating stems... This may take a few moments.');
    try {
      const results = await separateStems();
      setStems(results);
      toast.success('Stem separation complete!');
    } catch (e) {
      toast.error('Failed to separate stems');
    } finally {
      setIsSeparating(false);
    }
  };

  const handleAddStem = (buffer: AudioBuffer, name: string) => {
    addMixerTrack(buffer, name);
    toast.success(`Added ${name} to mixer`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-10 pr-2">
      
      {/* Auto-Mastering */}
      <div className="glass-panel p-6 rounded-xl space-y-6 flex flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">Smart Mastering</h2>
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Analyzes integrated loudness (LUFS) and applies corrective gain, gentle compression, and high-frequency air to achieve a target of -14 LUFS.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={analyzeLoudness} 
              disabled={!isLoaded}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
            >
              Analyze Track
            </button>
            <button 
              onClick={autoMaster} 
              disabled={!isLoaded || !loudnessData}
              className="flex-1 py-2 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(0,212,255,0.2)]"
            >
              Apply Auto-Master
            </button>
          </div>
          
          {loudnessData && (
            <div className="bg-black/30 p-4 rounded-lg border border-white/5 space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current LUFS</span>
                <span className={`font-mono ${loudnessData.integratedLUFS < -18 || loudnessData.integratedLUFS > -10 ? 'text-red-400' : 'text-green-400'}`}>
                  {loudnessData.integratedLUFS.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target LUFS</span>
                <span className="font-mono text-green-400">-14.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dynamic Range</span>
                <span className="font-mono text-white">{loudnessData.dynamicRange.toFixed(1)} LU</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stem Separation */}
      <div className="glass-panel p-6 rounded-xl space-y-6 flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-medium">Stem Separation</h2>
          </div>
          {isSeparating && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        </div>
        
        <p className="text-sm text-muted-foreground">
          Extract vocals, drums, bass, and melody into separate tracks using frequency-band approximation.
        </p>
        
        <button 
          onClick={handleSeparate} 
          disabled={!isLoaded || isSeparating}
          className="w-full py-3 bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30 rounded-lg text-sm transition-colors shadow-[0_0_15px_rgba(123,44,191,0.2)] font-medium flex justify-center items-center gap-2"
        >
          {isSeparating ? 'Processing Audio...' : 'Separate Stems'}
        </button>

        {Object.keys(stems).length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {Object.entries(stems).map(([name, buf]) => (
              <div key={name} className="bg-black/30 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider font-mono text-muted-foreground">{name}</span>
                <button 
                  onClick={() => buf && handleAddStem(buf, name)}
                  className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center justify-center gap-2"
                >
                  <Music className="w-3 h-3" /> Add to Mixer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
