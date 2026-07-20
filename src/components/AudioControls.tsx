import { Play, Pause, Square, Download, Loader2 } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { Slider } from './ui/slider';
import { useEffect, useState, useRef } from 'react';

export function AudioControls() {
  const { isPlaying, isLoaded, togglePlay, stop, seek, engine, exportWav, currentTrack } = useAudio();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isLoaded) {
      setProgress(0);
      setDuration(0);
      return;
    }

    setDuration(engine.getDuration());

    const updateProgress = () => {
      if (engine.isPlaying) {
        setProgress(engine.getCurrentTime());
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    rafRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded, engine, isPlaying]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = async () => {
    if (!isLoaded) return;
    try {
      setIsExporting(true);
      const blob = await exportWav();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTrack?.name || 'echolab-export'}-processed.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(0,212,255,0.4)]"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        
        <button
          onClick={stop}
          disabled={!isLoaded || (!isPlaying && progress === 0)}
          className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        <div className="flex-1 flex flex-col gap-1 mx-4">
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onValueChange={([val]) => {
              setProgress(val);
            }}
            onValueCommit={([val]) => {
              seek(val);
            }}
            disabled={!isLoaded}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={!isLoaded || isExporting}
          className="px-4 py-2 rounded-lg bg-black/50 border border-white/10 flex items-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:pointer-events-none group"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Download className="w-4 h-4 group-hover:text-primary transition-colors" />
          )}
          <span className="hidden sm:inline">{isExporting ? 'Rendering...' : 'WAV'}</span>
        </button>
      </div>
    </div>
  );
}
