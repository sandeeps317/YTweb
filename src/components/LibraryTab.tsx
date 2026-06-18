import React from "react";
import { Video } from "../types";
import { Heart, Clock, Trash2, Library, BookOpen, Film } from "lucide-react";
import VideoCard from "./VideoCard";

interface LibraryTabProps {
  favorites: Video[];
  watchHistory: Video[];
  playlistHistory: { id: string; title: string; channelName: string; trackingDate: string }[];
  onSelectVideo: (video: Video) => void;
  currentVideo: Video | null;
  onClearHistory: () => void;
  onClearFavorites: () => void;
  onToggleFavorite: (video: Video) => void;
}

export default function LibraryTab({
  favorites,
  watchHistory,
  playlistHistory,
  onSelectVideo,
  currentVideo,
  onClearHistory,
  onClearFavorites,
  onToggleFavorite
}: LibraryTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FAVORITES BOOKMARKS DECK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Heart size={18} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100">Local Bookmarks</h3>
                <p className="text-[10px] text-slate-400">Offline favorite streams saved on your device.</p>
              </div>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={onClearFavorites}
                className="text-xs font-mono text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear all Bookmarks"
              >
                <Trash2 size={13} />
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Heart size={28} className="text-slate-700 mb-2 animate-bounce" />
                <p className="text-xs text-slate-500">No bookmarks saved yet.</p>
                <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                  Click the heart icon next to any video in lists to add it here.
                </p>
              </div>
            ) : (
              favorites.map(video => (
                <div key={`fav-${video.id}`} className="relative group">
                  <VideoCard
                    video={video}
                    onClick={onSelectVideo}
                    isActive={currentVideo?.id === video.id}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(video);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-red-500/20 hover:text-red-400 text-pink-400 border border-slate-700/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from bookmarks"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WATCH HISTORY FEED */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100">Streaming History</h3>
                <p className="text-[10px] text-slate-400">Chronological history of recently loaded streams.</p>
              </div>
            </div>
            {watchHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs font-mono text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Clear Watch History"
              >
                <Trash2 size={13} />
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {watchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock size={28} className="text-slate-700 mb-2" />
                <p className="text-xs text-slate-500">History is clean.</p>
                <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                  Your play logs automatically appear here offline.
                </p>
              </div>
            ) : (
              watchHistory.map((video, idx) => (
                <VideoCard
                  key={`hist-${video.id}-${idx}`}
                  video={video}
                  onClick={onSelectVideo}
                  isActive={currentVideo?.id === video.id}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* PLAYLIST ARCHIVE HISTORY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-slate-100">Visited Playlists</h3>
              <p className="text-[10px] text-slate-400">Offline logs of playlists browsed in this session.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {playlistHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No recent playlists. Search or find playlists to seed records.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {playlistHistory.map((pl, idx) => (
                <div
                  key={`plhist-${pl.id}-${idx}`}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-left flex justify-between items-center gap-4"
                >
                  <div className="min-w-0">
                    <h4 className="font-sans font-bold text-xs text-slate-200 truncate">{pl.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {pl.channelName} • ID: {pl.id}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded flex-shrink-0">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
