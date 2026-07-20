import { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useFirebase } from '../hooks/useFirebase';
import { defaultEffects } from '../utils/AudioEngine';
import { Slider } from './ui/slider';
import { Settings2, RefreshCw, Share2, Loader2 } from 'lucide-react';

const presets = [
  { name: 'Slowed + Reverb', icon: '🌌', values: { speed: 0.7, reverb: 0.8, pitch: -3 } },
  { name: '8D Audio', icon: '🎧', values: { pan8D: 0.9, reverb: 0.3 } },
  { name: 'Lo-Fi', icon: '📻', values: { speed: 0.9, lowpass: 3000, bass: 4, reverb: 0.4 } },
  { name: 'Nightcore', icon: '⚡', values: { speed: 1.3, pitch: 4 } },
  { name: 'Vaporwave', icon: '🌴', values: { speed: 0.75, reverb: 0.6, bass: 3, pitch: -2 } },
  { name: 'Deep Bass', icon: '🔊', values: { bass: 10, highpass: 20, lowpass: 18000, volume: 1.3 } },
  { name: 'Clean', icon: '🧹', values: defaultEffects }
];

const effectConfig = [
  { key: 'speed', name: 'Speed', min: 0.25, max: 2.0, step: 0.05, unit: 'x' },
  { key: 'pitch', name: 'Pitch', min: -12, max: 12, step: 1, unit: 'st' },
  { key: 'reverb', name: 'Reverb', min: 0, max: 1, step: 0.05, unit: '%' },
  { key: 'delay', name: 'Delay', min: 0, max: 100, step: 1, unit: 'ms' },
  { key: 'pan8D', name: '8D Pan', min: 0, max: 1, step: 0.05, unit: '%' },
  { key: 'distortion', name: 'Distortion', min: 0, max: 1, step: 0.05, unit: '%' },
  { key: 'bass', name: 'Bass', min: -10, max: 10, step: 1, unit: 'dB' },
  { key: 'treble', name: 'Treble', min: -10, max: 10, step: 1, unit: 'dB' },
  { key: 'lowpass', name: 'Low Pass', min: 100, max: 20000, step: 100, unit: 'Hz' },
  { key: 'highpass', name: 'High Pass', min: 20, max: 1000, step: 10, unit: 'Hz' },
  { key: 'volume', name: 'Volume', min: 0, max: 1.5, step: 0.05, unit: 'x' }
];

export function EffectsPanel() {
  const { effects, updateEffects, isLoaded } = useAudio();
  const { sharePreset, user } = useFirebase();
  const [sharing, setSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('My Preset');

  const handleReset = () => updateEffects(defaultEffects);
  const applyPreset = (values: Partial<typeof defaultEffects>) => updateEffects({ ...defaultEffects, ...values });

  const handleShare = async () => {
    setSharing(true);
    await sharePreset(presetName.trim() || 'My Preset', effects as object);
    setSharing(false);
    setShareModalOpen(false);
  };

  return (
    <>
      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2>Basic Effects Chain</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              disabled={!isLoaded}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 hover:border-secondary/50 text-secondary rounded-lg transition-all disabled:opacity-40"
              title="Share current effects as a public preset"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Preset
            </button>
            <button
              onClick={handleReset}
              className="text-muted-foreground hover:text-white transition-colors"
              title="Reset all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-white/5 bg-black/10 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.values)}
                disabled={!isLoaded}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/10 text-sm whitespace-nowrap transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{preset.icon}</span>
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-h-[300px] overflow-y-auto">
          {effectConfig.map((config) => {
            const value = effects[config.key as keyof typeof defaultEffects] as number;
            const isActive = value !== defaultEffects[config.key as keyof typeof defaultEffects];

            return (
              <div key={config.key} className="space-y-3 group">
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium transition-colors ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : 'text-muted-foreground group-hover:text-white/80'}`}>
                    {config.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground bg-black/50 px-2 py-0.5 rounded border border-white/5">
                    {config.unit === '%' ? Math.round(value * 100) : value}{config.unit}
                  </span>
                </div>
                <Slider
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={[value]}
                  onValueChange={([val]) => updateEffects({ [config.key]: val })}
                  disabled={!isLoaded}
                  className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Share preset modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShareModalOpen(false)}>
          <div className="glass-panel p-6 rounded-2xl w-80 space-y-4 border border-secondary/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-secondary" /> Share Preset
            </h3>
            <p className="text-xs text-muted-foreground">
              {user ? 'Save your current effect settings as a public preset and copy a shareable link.' : 'You\'ll be prompted to sign in with Google.'}
            </p>
            <input
              type="text"
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary"
            />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShareModalOpen(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-muted-foreground hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 py-2 rounded-lg bg-secondary text-white font-medium text-sm hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                {sharing ? 'Sharing…' : 'Share & Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
