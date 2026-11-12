import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Shuffle,
  Music2,
  Sparkles,
  Play,
  Pause,
  Headphones,
  Sliders,
  Check,
  UploadCloud,
  Trash2,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { FocusTrack } from '../types';
import { focusMusic, FOCUS_TRACKS } from '../utils/focusMusicEngine';
import { saveCustomTrack, deleteCustomTrack } from '../utils/customAudioStorage';

interface FocusMusicSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusMusicSelector: React.FC<FocusMusicSelectorProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentTrack, setCurrentTrack] = useState<FocusTrack>(focusMusic.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState<boolean>(focusMusic.getIsPlaying());
  const [volume, setVolume] = useState<number>(focusMusic.getVolume());
  const [isAuto, setIsAuto] = useState<boolean>(focusMusic.isAutoMatch());
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const [customTracks, setCustomTracks] = useState<FocusTrack[]>(focusMusic.getCustomTracks());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = focusMusic.subscribe((track, playing) => {
      setCurrentTrack(track);
      setIsPlaying(playing);
      setIsAuto(focusMusic.isAutoMatch());
      setCustomTracks(focusMusic.getCustomTracks());
    });
    return () => {
      unsub();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggle = () => {
    focusMusic.toggle();
  };

  const handleShuffleRandom = () => {
    const all = focusMusic.getAllTracks().filter((t) => t.id !== currentTrack.id);
    if (all.length) focusMusic.pickTrack(all[Math.floor(Math.random() * all.length)].id);
  };

  // Picking a track keeps it playing on every reel until Auto is chosen again.
  const handleSelectTrack = (trackId: string) => {
    focusMusic.pickTrack(trackId);
  };

  const handleChooseAuto = () => {
    focusMusic.setAutoMatch();
    focusMusic.start();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    focusMusic.setVolume(val);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check if audio file
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setUploadError('Please select a valid audio file (.mp3, .wav, .ogg, .m4a, .aac)');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const newTrack = await saveCustomTrack(file);
      focusMusic.addCustomTrack(newTrack);
      setCustomTracks(focusMusic.getCustomTracks());
      setActiveTab('custom');
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Could not save audio file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCustomTrack = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    try {
      await deleteCustomTrack(trackId);
      focusMusic.removeCustomTrack(trackId);
      setCustomTracks(focusMusic.getCustomTracks());
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="w-full max-w-md glass-panel bg-neutral-950/95 rounded-3xl border border-white/15 p-5 shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Reel Sounds</h3>
              <p className="text-[10px] text-white/60">Ambient Soundscapes & Custom User Audio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full glass-pill text-white/70 hover:text-white transition-colors text-xs font-mono"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Currently Playing Card */}
        <div className="p-3.5 rounded-2xl glass-pill border border-white/20 mb-3 bg-white/5 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isPlaying ? 'animate-ping' : ''}`} />
              <span>{isPlaying ? (currentTrack.isCustomUploaded ? 'Custom Audio Playing' : 'Ambient Audio Active') : 'Audio Paused'}</span>
            </span>

            {/* Random Shuffle Button */}
            <button
              onClick={handleShuffleRandom}
              className="flex items-center space-x-1 text-[10.5px] font-semibold text-white/90 hover:text-white glass-pill px-2.5 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-all active:scale-95"
              title="Select Random Track"
            >
              <Shuffle className="w-3 h-3 text-amber-400" />
              <span>Shuffle</span>
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{currentTrack.title}</h4>
              {currentTrack.isCustomUploaded && (
                <span className="text-[9px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full">
                  User Audio
                </span>
              )}
            </div>
            <p className="text-xs text-white/70 truncate">{currentTrack.description}</p>
          </div>

          {/* Player controls */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <button
              onClick={handleToggle}
              className="px-4 py-1.5 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center space-x-1.5 hover:bg-neutral-200 transition-colors shadow-md"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause Audio' : 'Play Soundtrack'}</span>
            </button>

            {/* Volume slider */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-3.5 h-3.5 text-white/60" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-18 accent-rose-500 cursor-pointer h-1"
                title="Master Volume"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation: Built-in Soundscapes vs My Uploaded Tracks */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-black/40 border border-white/10 mb-3 shrink-0">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'builtin'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Built-in ({FOCUS_TRACKS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'custom'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>My Uploads ({customTracks.length})</span>
          </button>
        </div>

        {/* TAB 1: BUILT-IN SOUNDSCAPES */}
        {activeTab === 'builtin' && (
          <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
            <button
              id="btn-sound-auto"
              onClick={handleChooseAuto}
              className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                isAuto ? 'bg-white/20 border border-white/30 text-white shadow-md' : 'glass-pill text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="truncate pr-2">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="text-xs font-bold truncate">Auto: match each reel</span>
                </div>
                <div className="text-[10px] text-white/50 truncate">Every reel plays its own sound. Quran and Hadith use nature sounds.</div>
              </div>
              {isAuto && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
            {FOCUS_TRACKS.map((track) => {
              const isSelected = !isAuto && track.id === currentTrack.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-white/20 border border-white/30 text-white shadow-md'
                      : 'glass-pill text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold truncate">{track.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                        {track.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/50 truncate">{track.mood}</div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: MY UPLOADED TRACKS + UPLOAD ZONE */}
        {activeTab === 'custom' && (
          <div className="flex flex-col flex-1 overflow-hidden space-y-2.5">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center shrink-0 ${
                isDragging
                  ? 'border-rose-400 bg-rose-500/15 scale-[0.99]'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              <UploadCloud className={`w-6 h-6 mb-1.5 ${isDragging ? 'text-rose-400 animate-bounce' : 'text-white/60'}`} />
              <span className="text-xs font-bold text-white mb-0.5">
                {isUploading ? 'Saving Audio Track...' : 'Click or Drag Audio Track Here'}
              </span>
              <span className="text-[10px] text-white/50">
                Supports MP3, WAV, OGG, M4A, AAC
              </span>
            </div>

            {uploadError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-2 text-center">
                {uploadError}
              </div>
            )}

            {/* Uploaded Tracks List */}
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
              {customTracks.length === 0 ? (
                <div className="text-center py-6 text-white/40 text-xs">
                  No uploaded sound tracks yet. Upload your favorite study music or ambient sounds!
                </div>
              ) : (
                customTracks.map((track) => {
                  const isSelected = track.id === currentTrack.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrack(track.id)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between cursor-pointer transition-all group ${
                        isSelected
                          ? 'bg-rose-500/20 border border-rose-500/40 text-white shadow-md'
                          : 'glass-pill text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="truncate pr-2 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold truncate">{track.title}</span>
                          {track.fileSize && (
                            <span className="text-[9px] font-mono text-white/40">
                              {(track.fileSize / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50 truncate">{track.description}</div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {isSelected && (
                          <Check className="w-4 h-4 text-rose-400 mr-1" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomTrack(e, track.id)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/20 transition-colors opacity-80 group-hover:opacity-100"
                          title="Delete soundtrack"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

