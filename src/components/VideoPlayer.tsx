import React, { useRef } from "react";
import { Video } from "../types";
import { SkipForward, SkipBack, Shuffle, Volume2, HelpCircle, X, Maximize2 } from "lucide-react";

interface VideoPlayerProps {
  currentVideo: Video | null;
  playlist: Video[];
  currentIndex: number;
  isShuffle: boolean;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onSelectVideo: (video: Video) => void;
  isMini?: boolean;
  onCloseMini?: () => void;
  onMaximize?: () => void;
}

export default function VideoPlayer({
  currentVideo,
  playlist,
  currentIndex,
  isShuffle,
  onNext,
  onPrev,
  onToggleShuffle,
  onSelectVideo,
  isMini = false,
  onCloseMini,
  onMaximize
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!currentVideo) {
    if (isMini) return null;
    return (
      <div className="w-full bg-slate-900/60 rounded-2xl border border-slate-800/80 aspect-video flex flex-col items-center justify-center text-center p-8 backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
          <HelpCircle size={32} />
        </div>
        <h3 className="font-sans font-semibold text-lg text-slate-300">No Stage Loaded</h3>
        <p className="font-sans text-sm text-slate-500 max-w-sm mt-2">
          Select or search for a video below to begin streaming.
        </p>
      </div>
    );
  }

  // Dual layout render block for mini floating layout
  if (isMini) {
    return (
      <div className="w-full bg-zinc-950 rounded-2xl overflow-hidden flex flex-col group border border-zinc-800" ref={containerRef}>
        <div className="relative w-full aspect-video bg-black flex-shrink-0">
          <iframe
            id="active-mini-ytweb-player"
            className="w-full h-full border-0 absolute inset-0"
            src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
            title={currentVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Hover absolute actions overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2 pointer-events-none">
            <div className="flex items-center justify-between w-full pointer-events-auto">
              <span className="text-[10px] text-zinc-100 font-bold truncate max-w-[65%] bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-800">
                {currentVideo.channelName}
              </span>
              <div className="flex items-center gap-1.5">
                {onMaximize && (
                  <button
                    onClick={onMaximize}
                    title="Maximize Theatre watch view"
                    className="p-1 rounded bg-zinc-900/95 hover:bg-zinc-800 text-white transition-all cursor-pointer border border-zinc-800"
                  >
                    <Maximize2 size={11} />
                  </button>
                )}
                {onCloseMini && (
                  <button
                    onClick={onCloseMini}
                    title="Close stream"
                    className="p-1 rounded bg-zinc-900/95 hover:bg-zinc-850 hover:text-red-500 text-white transition-all cursor-pointer border border-zinc-800"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Bottom micro-bar controller */}
        <div className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-2 w-full">
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] text-zinc-100 font-bold truncate leading-tight">{currentVideo.title}</h4>
            <p className="text-[9px] text-zinc-500 truncate mt-0.5">{currentVideo.channelName}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onPrev}
              disabled={playlist.length <= 1}
              title="Previous"
              className="p-1.5 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-zinc-800/50 flex items-center justify-center"
            >
              <SkipBack size={11} />
            </button>
            <button
              onClick={onNext}
              disabled={playlist.length <= 1}
              title="Next"
              className="p-1.5 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-zinc-800/50 flex items-center justify-center"
            >
              <SkipForward size={11} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full-featured widescreen Theatre layout
  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col flex-shrink-0" ref={containerRef}>
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <iframe
          id="active-ytweb-player"
          className="w-full h-full border-0 absolute inset-0"
          src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`}
          title={currentVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-sans font-bold text-base md:text-lg text-slate-100 line-clamp-1 leading-snug">
              {currentVideo.title}
            </h2>
            <div className="flex-shrink-0 px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-semibold tracking-wider text-slate-400 border border-slate-700/40">
              SRC YT: {currentVideo.id}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-indigo-400 hover:underline cursor-pointer">
              {currentVideo.channelName}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">{currentVideo.views}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">{currentVideo.publishedAt}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800/85 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={playlist.length <= 1}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
              title="Previous Video"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={onNext}
              disabled={playlist.length <= 1}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
              title="Next Video"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={onToggleShuffle}
              className={`p-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                isShuffle
                  ? "bg-indigo-600 text-white font-semibold"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-400"
              }`}
              title="Shuffle Playlist"
            >
              <Shuffle size={16} />
              <span className="text-xs font-mono hidden md:inline">Shuffle</span>
            </button>
          </div>

          {playlist.length > 0 && (
            <div className="font-mono text-xs text-slate-500 font-medium">
              Track {currentIndex + 1} of {playlist.length}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/20 text-slate-405 text-xs leading-normal flex gap-2">
          <Volume2 className="text-indigo-400 flex-shrink-0" size={16} />
          <div>
            <span className="font-semibold text-indigo-300">Compatible Sandbox Mode:</span> Optimized to avoid redundant CPU loops and double audio. Fully safe for older iPad Safari versions.
          </div>
        </div>
      </div>
    </div>
  );
}
