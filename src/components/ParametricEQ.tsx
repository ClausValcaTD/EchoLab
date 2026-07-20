import { useRef, useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { EQBandDef } from '../utils/AudioEngine';

export function ParametricEQ() {
  const { engine, effects, updateEffects } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Draw Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].forEach(f => {
      const x = freqToX(f, w);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    });
    [-24, -12, 0, 12, 24].forEach(g => {
      const y = gainToY(g, h);
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    });
    ctx.stroke();

    // Draw 0dB line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();

    // Draw Response Curve (Approximation for visuals)
    ctx.beginPath();
    ctx.lineWidth = 2;
    for (let x = 0; x < w; x++) {
      const freq = xToFreq(x, w);
      let totalGain = 0;
      
      effects.eqBands.forEach(band => {
        // Very simplified bell curve for visualization
        const dist = Math.abs(Math.log10(freq) - Math.log10(band.freq));
        const effect = Math.max(0, 1 - (dist * band.q));
        totalGain += band.gain * effect;
      });

      const y = gainToY(totalGain, h);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(1, '#7b2cbf');
    ctx.strokeStyle = grad;
    ctx.stroke();
    
    // Fill under curve
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fillStyle = 'rgba(123, 44, 191, 0.1)';
    ctx.fill();

    // Draw nodes
    effects.eqBands.forEach((band, i) => {
      const x = freqToX(band.freq, w);
      const y = gainToY(band.gain, h);
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = i === dragging ? '#fff' : '#00d4ff';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  useEffect(() => {
    draw();
  }, [effects.eqBands, dragging]);

  // Helpers
  const freqToX = (f: number, w: number) => {
    const minL = Math.log10(20);
    const maxL = Math.log10(20000);
    return ((Math.log10(Math.max(20, f)) - minL) / (maxL - minL)) * w;
  };
  const xToFreq = (x: number, w: number) => {
    const minL = Math.log10(20);
    const maxL = Math.log10(20000);
    return Math.pow(10, minL + (x / w) * (maxL - minL));
  };
  const gainToY = (g: number, h: number) => {
    return h/2 - (g / 24) * (h/2);
  };
  const yToGain = (y: number, h: number) => {
    return ((h/2 - y) / (h/2)) * 24;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let closest = -1;
    let minDist = 20; // 20px radius hit area
    
    effects.eqBands.forEach((band, i) => {
      const bx = freqToX(band.freq, canvas.width);
      const by = gainToY(band.gain, canvas.height);
      const dist = Math.hypot(bx - x, by - y);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    
    if (closest !== -1) {
      setDragging(closest);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
    
    const newBands = [...effects.eqBands];
    newBands[dragging] = {
      ...newBands[dragging],
      freq: xToFreq(x, canvas.width),
      gain: Math.max(-24, Math.min(24, yToGain(y, canvas.height)))
    };
    updateEffects({ eqBands: newBands });
  };

  const handlePointerUp = () => setDragging(null);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-foreground">Parametric EQ</h3>
      <div className="relative w-full h-64 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-mono px-2">
        <span>20Hz</span>
        <span>1kHz</span>
        <span>20kHz</span>
      </div>
    </div>
  );
}
