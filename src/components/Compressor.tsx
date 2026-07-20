import { useAudio } from '../contexts/AudioContext';
import { Slider } from './ui/slider';

export function Compressor() {
  const { effects, updateEffects } = useAudio();
  const { compressor } = effects;

  const handleChange = (key: keyof typeof compressor, val: number) => {
    updateEffects({ compressor: { ...compressor, [key]: val } });
  };

  const configs = [
    { key: 'threshold', label: 'Threshold', min: -60, max: 0, step: 1, unit: 'dB' },
    { key: 'ratio', label: 'Ratio', min: 1, max: 20, step: 0.5, unit: ':1' },
    { key: 'attack', label: 'Attack', min: 0.001, max: 1, step: 0.001, unit: 's' },
    { key: 'release', label: 'Release', min: 0.01, max: 1, step: 0.01, unit: 's' }
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Dynamics Compressor</h3>
        <div className="flex gap-2">
          <button onClick={() => updateEffects({ compressor: { threshold: -15, ratio: 2.5, attack: 0.005, release: 0.2, knee: 30 }})} className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Vocal</button>
          <button onClick={() => updateEffects({ compressor: { threshold: -20, ratio: 6, attack: 0.002, release: 0.1, knee: 10 }})} className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded">Punchy</button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {configs.map(cfg => (
          <div key={cfg.key} className="flex flex-col items-center gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
            <div className="h-32 py-2">
              <Slider
                orientation="vertical"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={[compressor[cfg.key]]}
                onValueChange={([v]) => handleChange(cfg.key, v)}
              />
            </div>
            <span className="text-xs font-mono">{compressor[cfg.key].toFixed(cfg.key === 'ratio' ? 1 : 2)}{cfg.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
