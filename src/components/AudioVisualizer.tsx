import { useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine, isLoaded } = useAudio();
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resize
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        // Normalize coordinate system to use css pixels
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = `${parent.clientWidth}px`;
        canvas.style.height = `${parent.clientHeight}px`;
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear canvas with slight fade for trailing effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (!isLoaded) {
         // Draw idle state
         ctx.beginPath();
         ctx.moveTo(0, height / 2);
         ctx.lineTo(width, height / 2);
         ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
         ctx.lineWidth = 2;
         ctx.stroke();
         animationRef.current = requestAnimationFrame(draw);
         return;
      }

      const freqData = engine.getAnalyserData();
      const waveData = engine.getWaveformData();

      // Draw Frequency Bars
      const barWidth = (width / freqData.length) * 2.5;
      let x = 0;

      for (let i = 0; i < freqData.length; i++) {
        const barHeight = (freqData[i] / 255) * height * 0.8;
        
        // Gradient from Cyan to Purple based on x position
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#00d4ff'); // Cyan
        gradient.addColorStop(1, '#7b2cbf'); // Purple

        ctx.fillStyle = gradient;
        // Add a slight glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';
        
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        ctx.shadowBlur = 0; // reset
        x += barWidth + 1;
      }

      // Draw Waveform Overlay
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();

      const sliceWidth = width * 1.0 / waveData.length;
      let waveX = 0;

      for (let i = 0; i < waveData.length; i++) {
        const v = waveData[i] / 128.0; // 0 to 2
        const y = v * height / 2;

        if (i === 0) {
          ctx.moveTo(waveX, y);
        } else {
          ctx.lineTo(waveX, y);
        }

        waveX += sliceWidth;
      }

      ctx.lineTo(canvas.width, height / 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [engine, isLoaded]);

  return (
    <div className="w-full h-full min-h-[200px] glass-panel rounded-xl overflow-hidden relative group border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none opacity-50" />
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block relative z-0"
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="text-white/20 text-sm font-mono tracking-widest uppercase">AWAITING SIGNAL</span>
        </div>
      )}
    </div>
  );
}
