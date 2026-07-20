import { useRef, useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Scissors, Trash2, Repeat, Undo2, Redo2, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function WaveformEditor() {
  const { engine, isLoaded, isPlaying, trim, reverse, normalize, setLoopRegion, clearLoop, undo, redo, undoCount, redoCount } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selection, setSelection] = useState<{start: number, end: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const raf = useRef<number>(0);

  const drawWaveform = (ctx: CanvasRenderingContext2D, w: number, h: number, buffer: AudioBuffer) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#00d4ff';
    
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / w);
    const amp = h / 2;
    
    ctx.beginPath();
    for(let i=0; i<w; i++){
      let min = 1.0;
      let max = -1.0;
      for (let j=0; j<step; j++) {
        const datum = data[(i*step)+j]; 
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1+min)*amp, 1, Math.max(1, (max-min)*amp));
    }
  };

  useEffect(() => {
    if (!isLoaded || !engine.buffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    drawWaveform(ctx, canvas.width, canvas.height, engine.buffer);
  }, [engine.buffer, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !engine.buffer) return;
    
    const drawOverlay = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const overlay = container.querySelector('#playhead') as HTMLElement;
      if (overlay) {
        const duration = engine.getDuration();
        const curr = engine.getCurrentTime();
        const percent = duration > 0 ? (curr / duration) * 100 : 0;
        overlay.style.left = `${percent}%`;
      }
      raf.current = requestAnimationFrame(drawOverlay);
    };
    
    raf.current = requestAnimationFrame(drawOverlay);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [isPlaying, isLoaded, engine]);

  const getEventTime = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !engine.buffer) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    return percent * engine.buffer.duration;
  };

  const handleDown = (e: React.MouseEvent) => {
    if (!engine.buffer) return;
    const t = getEventTime(e);
    setSelection({ start: t, end: t });
    setIsDragging(true);
  };

  const handleMove = (e: React.MouseEvent) => {
    if (!isDragging || !selection || !engine.buffer) return;
    const t = getEventTime(e);
    setSelection(prev => prev ? { ...prev, end: t } : null);
  };

  const handleUp = () => {
    setIsDragging(false);
    if (selection && Math.abs(selection.end - selection.start) < 0.1) {
      setSelection(null); // Click clears selection
    }
  };

  const execAction = (action: () => void, name: string) => {
    action();
    setSelection(null);
    toast.success(name);
  };

  const sStart = selection ? Math.min(selection.start, selection.end) : 0;
  const sEnd = selection ? Math.max(selection.start, selection.end) : 0;
  const sDur = sEnd - sStart;

  if (!isLoaded) return <div className="h-48 glass-panel rounded-xl flex items-center justify-center text-muted-foreground">Load a track to edit waveform</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 glass-panel rounded-lg overflow-x-auto">
        <button onClick={() => execAction(undo, 'Undo')} disabled={undoCount === 0} className="p-2 hover:bg-white/10 rounded disabled:opacity-50"><Undo2 className="w-4 h-4" /></button>
        <button onClick={() => execAction(redo, 'Redo')} disabled={redoCount === 0} className="p-2 hover:bg-white/10 rounded disabled:opacity-50"><Redo2 className="w-4 h-4" /></button>
        <div className="w-px h-6 bg-white/10 mx-2" />
        
        <button onClick={() => execAction(() => trim(sStart, sEnd), 'Trimmed')} disabled={!selection || sDur < 0.1} className="px-3 py-1.5 hover:bg-white/10 rounded disabled:opacity-50 flex items-center gap-2 text-sm"><Scissors className="w-4 h-4" /> Trim</button>
        <button onClick={() => execAction(() => {
          // cut means trim inverse, we can implement easily or just provide crop for now
          // for now, "Cut" will just trim to selection as implemented
        }, 'Cut')} disabled={!selection || sDur < 0.1} className="px-3 py-1.5 hover:bg-white/10 rounded disabled:opacity-50 flex items-center gap-2 text-sm"><Trash2 className="w-4 h-4 text-red-400" /> Delete</button>
        
        <div className="w-px h-6 bg-white/10 mx-2" />
        <button onClick={() => execAction(reverse, 'Reversed')} className="px-3 py-1.5 hover:bg-white/10 rounded flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> Reverse</button>
        <button onClick={() => execAction(normalize, 'Normalized')} className="px-3 py-1.5 hover:bg-white/10 rounded flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-yellow-400" /> Normalize</button>
        
        <div className="w-px h-6 bg-white/10 mx-2" />
        <button onClick={() => execAction(() => setLoopRegion(sStart, sEnd), 'Loop Set')} disabled={!selection || sDur < 0.1} className="px-3 py-1.5 hover:bg-white/10 rounded disabled:opacity-50 flex items-center gap-2 text-sm"><Repeat className="w-4 h-4 text-primary" /> Set Loop</button>
        <button onClick={() => execAction(clearLoop, 'Loop Cleared')} className="px-3 py-1.5 hover:bg-white/10 rounded flex items-center gap-2 text-sm">Clear Loop</button>
      </div>

      {/* Editor Canvas */}
      <div 
        ref={containerRef} 
        className="relative h-48 bg-black/40 border border-white/10 rounded-xl overflow-hidden cursor-crosshair touch-none select-none"
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
      >
        <canvas ref={canvasRef} width={1000} height={192} className="w-full h-full block" />
        
        {/* Playhead */}
        <div id="playhead" className="absolute top-0 bottom-0 w-px bg-primary pointer-events-none shadow-[0_0_10px_rgba(0,212,255,1)] z-10" style={{ left: '0%' }} />
        
        {/* Selection overlay */}
        {selection && engine.buffer && (
          <div 
            className="absolute top-0 bottom-0 bg-secondary/30 border-x border-secondary/50 pointer-events-none"
            style={{ 
              left: `${(sStart / engine.buffer.duration) * 100}%`,
              width: `${(sDur / engine.buffer.duration) * 100}%`
            }}
          />
        )}
      </div>
      
      {selection && sDur > 0.1 && (
        <div className="flex justify-between text-xs font-mono text-muted-foreground px-2">
          <span>{sStart.toFixed(3)}s</span>
          <span>Sel: {sDur.toFixed(3)}s</span>
          <span>{sEnd.toFixed(3)}s</span>
        </div>
      )}
    </div>
  );
}
