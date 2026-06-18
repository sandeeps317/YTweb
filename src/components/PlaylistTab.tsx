import React from "react";
import { Playlist, Video } from "../types";
import { ListMusic, Play, Disc, ArrowLeft, ArrowRight, Library, Music3 } from "lucide-react";
import VideoCard from "./VideoCard";

interface PlaylistTabProps {
  playlist: Playlist | null;
  isLoading: boolean;
  onSelectVideo: (video: Video) => void;
  currentVideo: Video | null;
  onLoadEntirePlaylist: (videos: Video[]) => void;
}

export default function PlaylistTab({
  playlist,
  isLoading,
  onSelectVideo,
  currentVideo,
  onLoadEntirePlaylist
}: PlaylistTabProps) {

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse">
        {/* Playlist Header Skeleton */}
        <div className="flex gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-24 aspect-video bg-slate-950 rounded-lg" />
          <div className="flex flex-col gap-2.5 flex-1 justify-center">
            <div className="h-4 w-44 bg-slate-950 rounded" />
            <div className="h-3 w-24 bg-slate-950 rounded" />
          </div>
        </div>

        {/* Video cards skeleton list */}
        <div className="flex flex-col gap-3">
          {[1,2,3].map(n => (
            <div key={n} className="h-20 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <ListMusic size={36} className="text-slate-650 mb-3" />
        <h3 className="font-sans font-bold text-sm text-slate-300">No Playlist Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Find playlists inside the channel tabs, search dashboards or simply use our pre-seeded collections to experience full album continuous playback instantly.
        </p>
      </div>
    );
  }

  const tracks = playlist.videos || [];

  return (
    <div className="flex flex-col gap-5">
      {/* Playlist header statistics banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow flex-shrink-0">
            <img
              src={playlist.thumbnailUrl}
              alt={playlist.title}
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-indigo-400 border-l border-slate-850">
              <Disc size={13} className="animate-spin duration-3000" />
            </div>
          </div>
          <div>
            <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono font-bold tracking-wider text-indigo-400 inline-block">
              PLAYLIST PORTFOLIO
            </div>
            <h2 className="font-sans font-bold text-base md:text-lg text-slate-100 mt-1">
              {playlist.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated by <span className="font-semibold text-indigo-400">{playlist.channelName}</span> • <span className="font-mono text-indigo-300">{tracks.length} streams loaded</span>
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={() => onLoadEntirePlaylist(tracks)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono tracking-wider transition-all hover:scale-102 active:scale-95 shadow-md shadow-indigo-600/10"
          >
            <Play fill="#ffffff" size={13} className="ml-0.5" />
            PLAY ENTIRE SETLIST
          </button>
        )}
      </div>

      {/* Track listing frame */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-bold tracking-tight">
          <span className="flex items-center gap-1">
            <Music3 size={14} className="text-indigo-400" />
            SETLIST INDEX
          </span>
          <span className="font-mono text-[10px] text-slate-500">CLICK ITEM TO QUEUE STAGE</span>
        </div>

        <div className="flex flex-col gap-2">
          {tracks.length === 0 ? (
            <div className="p-10 rounded-xl bg-slate-900/35 border border-slate-800 text-center text-xs text-slate-500">
              No videos indexed inside this playlist.
            </div>
          ) : (
            tracks.map((video, idx) => {
              const active = currentVideo?.id === video.id;
              return (
                <div key={`pl-track-${video.id}-${idx}`} className="flex items-center gap-2.5">
                  <div className="w-6 text-center font-mono text-[11px] font-bold text-slate-500 flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <VideoCard
                      video={video}
                      onClick={onSelectVideo}
                      isActive={active}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
