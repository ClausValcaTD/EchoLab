import { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Disc3, Edit3, Check, X } from 'lucide-react';

export function MetadataPanel() {
  const { currentTrack, updateMetadata, isLoaded } = useAudio();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', artist: '', album: '', year: '' });

  useEffect(() => {
    if (currentTrack) {
      setEditForm({
        name: currentTrack.name || '',
        artist: currentTrack.artist || '',
        album: currentTrack.album || '',
        year: currentTrack.year || ''
      });
    }
    setIsEditing(false);
  }, [currentTrack]);

  if (!isLoaded || !currentTrack) {
    return (
      <div className="glass-panel rounded-xl p-6 h-full flex flex-col items-center justify-center text-muted-foreground border-white/5">
        <Disc3 className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">No track loaded</p>
      </div>
    );
  }

  const handleSave = () => {
    updateMetadata(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: currentTrack.name || '',
      artist: currentTrack.artist || '',
      album: currentTrack.album || '',
      year: currentTrack.year || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col relative h-full">
      {/* Background blurred cover */}
      {currentTrack.coverArt && (
        <div 
          className="absolute inset-0 z-0 opacity-20 blur-3xl scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${currentTrack.coverArt})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      
      <div className="relative z-10 flex flex-col p-6 h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/40 border border-white/10 shadow-xl shrink-0">
            {currentTrack.coverArt ? (
              <img src={currentTrack.coverArt} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Disc3 className="w-10 h-10 text-white/20" />
              </div>
            )}
          </div>
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancel} className="p-2 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {!isEditing ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight">
                  {currentTrack.name || 'Unknown Track'}
                </h3>
                <p className="text-primary mt-1">{currentTrack.artist || 'Unknown Artist'}</p>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Album</span>
                  <span className="text-foreground text-right">{currentTrack.album || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Year</span>
                  <span className="text-foreground text-right">{currentTrack.year || '-'}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Title</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Artist</label>
                <input
                  value={editForm.artist}
                  onChange={e => setEditForm(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Album</label>
                <input
                  value={editForm.album}
                  onChange={e => setEditForm(prev => ({ ...prev, album: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Year</label>
                <input
                  value={editForm.year}
                  onChange={e => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
