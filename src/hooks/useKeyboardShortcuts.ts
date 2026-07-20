import { useEffect, useCallback } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
  const { togglePlay, stop, seek, engine, undo, redo, isRecording, startRecording, stopRecording, updateEffects } = useAudio();

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        togglePlay();
        toast(engine.isPlaying ? 'Paused' : 'Playing', { duration: 1000 });
        break;
      case 'l':
        // Toggle loop handled here or in engine directly
        if (engine.isLooping) {
          engine.clearLoop();
          toast('Loop Off', { duration: 1000 });
        } else {
          engine.setLoopRegion(0, engine.getDuration()); // simple loop whole track
          toast('Loop On', { duration: 1000 });
        }
        break;
      case 'r':
        if (isRecording) {
          stopRecording();
          toast('Recording Stopped', { duration: 1000 });
        } else {
          startRecording();
          toast('Recording Started', { duration: 1000 });
        }
        break;
      case 's':
        stop();
        toast('Stopped', { duration: 1000 });
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          if (e.shiftKey) {
            redo();
            toast('Redo', { duration: 1000 });
          } else {
            undo();
            toast('Undo', { duration: 1000 });
          }
        }
        break;
      case 'y':
        if (e.ctrlKey || e.metaKey) {
          redo();
          toast('Redo', { duration: 1000 });
        }
        break;
      case 'arrowleft':
        seek(Math.max(0, engine.getCurrentTime() - 5));
        toast('Seek -5s', { duration: 1000 });
        break;
      case 'arrowright':
        seek(Math.min(engine.getDuration(), engine.getCurrentTime() + 5));
        toast('Seek +5s', { duration: 1000 });
        break;
      case 'm':
        engine.volumeNode.gain.value = engine.volumeNode.gain.value > 0 ? 0 : engine.effects.volume;
        toast(engine.volumeNode.gain.value > 0 ? 'Unmuted' : 'Muted', { duration: 1000 });
        break;
      case '1':
        updateEffects({ speed: 0.7, reverb: 0.8, pitch: -3 });
        toast('Preset: Slowed + Reverb', { duration: 1000 });
        break;
      case '2':
        updateEffects({ pan8D: 0.9, reverb: 0.3 });
        toast('Preset: 8D Audio', { duration: 1000 });
        break;
      case '3':
        updateEffects({ speed: 0.9, lowpass: 3000, bass: 4, reverb: 0.4 });
        toast('Preset: Lo-Fi', { duration: 1000 });
        break;
      case '4':
        updateEffects({ speed: 1.3, pitch: 4 });
        toast('Preset: Nightcore', { duration: 1000 });
        break;
      case '5':
        updateEffects({ speed: 0.75, reverb: 0.6, bass: 3, pitch: -2 });
        toast('Preset: Vaporwave', { duration: 1000 });
        break;
      case '6':
        updateEffects({ bass: 10, highpass: 20, lowpass: 18000, volume: 1.3 });
        toast('Preset: Deep Bass', { duration: 1000 });
        break;
      case '7':
        updateEffects({
          speed: 1.0, reverb: 0, pitch: 0, bass: 0, treble: 0, distortion: 0,
          delay: 0, pan8D: 0, volume: 1.0, lowpass: 20000, highpass: 20
        });
        toast('Preset: Clean', { duration: 1000 });
        break;
    }
  }, [togglePlay, engine, isRecording, startRecording, stopRecording, stop, undo, redo, seek, updateEffects]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);
}
