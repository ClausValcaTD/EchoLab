import { Upload, Music, Link as LinkIcon } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useState, useRef } from 'react';

export function AudioUploader() {
  const { loadTrack } = useAudio();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    await loadTrack({
      id: Date.now().toString(),
      name: file.name,
      file
    });
  };

  return (
    <div
      className={`glass-panel rounded-xl p-8 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden ${
        isDragging 
          ? 'border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(0,212,255,0.2)]' 
          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        accept="audio/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      
      <div className="w-16 h-16 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">Drop audio file here</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Supports MP3, WAV, FLAC, OGG, M4A. High quality processing happens entirely in your browser.
      </p>
    </div>
  );
}
