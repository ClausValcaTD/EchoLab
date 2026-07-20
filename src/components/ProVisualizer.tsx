import { useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';

export function ProVisualizer() {
  const { engine, isLoaded, loudnessData, analyzeLoudness } = useAudio();
  const freqCanvas = useRef<HTMLCanvasElement>(null);
  const specCanvas = useRef<HTMLCanvasElement>(null);
  const oscCanvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!isLoaded) return;
    
    const fCtx = freqCanvas.current?.getContext('2d');
    const sCtx = specCanvas.current?.getContext('2d');
    const oCtx = oscCanvas.current?.getContext('2d');
    
    if (specCanvas.current && sCtx) {
      sCtx.fillStyle = '#000';
      sCtx.fillRect(0, 0, specCanvas.current.width, specCanvas.current.height);
    }

    const draw = () => {
      const fData = engine.getAnalyserData();
      const wave = engine.getFloatTimeDomainData();

      // Freq Spectrum
      if (freqCanvas.current && fCtx) {
        const w = freqCanvas.current.width;
        const h = freqCanvas.current.height;
        fCtx.clearRect(0, 0, w, h);
        
        const barW = (w / fData.length) * 2.5;
        let x = 0;
        for (let i = 0; i < fData.length; i++) {
          const barH = (fData[i] / 255) * h * 0.9;
          const grad = fCtx.createLinearGradient(0, h, 0, h - barH);
          grad.addColorStop(0, '#00d4ff');
          grad.addColorStop(1, '#7b2cbf');
          fCtx.fillStyle = grad;
          fCtx.fillRect(x, h - barH, barW - 1, barH);
          x += barW;
        }
      }

      // Spectrogram (Scrolling)
      if (specCanvas.current && sCtx) {
        const w = specCanvas.current.width;
        const h = specCanvas.current.height;
        
        // Shift left
        const imgData = sCtx.getImageData(1, 0, w - 1, h);
        sCtx.putImageData(imgData, 0, 0);
        
        // Draw new column
        for (let i = 0; i < fData.length; i++) {
          const val = fData[i] / 255;
          const y = h - (i / fData.length) * h;
          // color mapping
          sCtx.fillStyle = `rgb(${val * 123}, ${val * 44}, ${val * 255})`; // purple tint
          if (val > 0.6) sCtx.fillStyle = `rgb(0, ${val * 212}, ${val * 255})`; // cyan for high
          sCtx.fillRect(w - 1, y, 1, h / fData.length);
        }
      }

      // Oscilloscope (Time domain)
      if (oscCanvas.current && oCtx) {
        const w = oscCanvas.current.width;
        const h = oscCanvas.current.height;
        oCtx.clearRect(0, 0, w, h);
        
        oCtx.beginPath();
        oCtx.strokeStyle = '#00d4ff';
        oCtx.lineWidth = 2;
        
        for (let i = 0; i < wave.length; i++) {
          const x = (i / wave.length) * w;
          const y = (wave[i] * 0.5 + 0.5) * h;
          if (i === 0) oCtx.moveTo(x, y);
          else oCtx.lineTo(x, y);
        }
        oCtx.stroke();
      }

      raf.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [engine, isLoaded]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <div className="glass-panel p-4 flex flex-col gap-2 rounded-xl">
        <h3 className="text-sm font-mono text-primary uppercase">Frequency Spectrum</h3>
        <canvas ref={freqCanvas} width={600} height={200} className="w-full h-full border border-white/5 rounded-lg bg-black/40" />
      </div>
      
      <div className="glass-panel p-4 flex flex-col gap-2 rounded-xl">
        <h3 className="text-sm font-mono text-primary uppercase">Spectrogram</h3>
        <canvas ref={specCanvas} width={600} height={200} className="w-full h-full border border-white/5 rounded-lg bg-black/40" />
      </div>
      
      <div className="glass-panel p-4 flex flex-col gap-2 rounded-xl">
        <h3 className="text-sm font-mono text-primary uppercase">Oscilloscope</h3>
        <canvas ref={oscCanvas} width={600} height={200} className="w-full h-full border border-white/5 rounded-lg bg-black/40" />
      </div>
      
      <div className="glass-panel p-4 flex flex-col gap-4 rounded-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-mono text-primary uppercase">Loudness Meter</h3>
          <button onClick={analyzeLoudness} disabled={!isLoaded} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs">
            Analyze
          </button>
        </div>
        
        {loudnessData ? (
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col items-center justify-end bg-black/40 rounded-lg p-2 relative border border-white/5">
              <div className="absolute top-4 w-full border-t border-green-500/50" style={{top: '30%'}} title="-14 LUFS Target" />
              <div 
                className={`w-12 rounded-t-sm transition-all duration-300 ${loudnessData.integratedLUFS > -9 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ height: `${Math.min(100, Math.max(0, (loudnessData.integratedLUFS + 70) * 1.5))}%` }}
              />
              <span className="mt-2 text-xs font-mono">{loudnessData.integratedLUFS.toFixed(1)} LUFS</span>
            </div>
            
            <div className="flex flex-col justify-center gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-muted-foreground uppercase">True Peak</div>
                <div className={`text-xl font-mono ${loudnessData.truePeak > -1 ? 'text-red-500' : 'text-white'}`}>
                  {loudnessData.truePeak.toFixed(2)} dBTP
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-[10px] text-muted-foreground uppercase">Dynamic Range</div>
                <div className="text-xl font-mono text-white">
                  {loudnessData.dynamicRange.toFixed(1)} LU
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Run analysis to view loudness data
          </div>
        )}
      </div>
    </div>
  );
}
