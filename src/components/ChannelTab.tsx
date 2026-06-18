import React, { useState } from "react";
import { Channel, Video } from "../types";
import { Film, PlaySquare, Video as VideoIcon, Radio, Disc, User, Info } from "lucide-react";
import VideoCard from "./VideoCard";

interface ChannelTabProps {
  channel: Channel | null;
  isLoading: boolean;
  onSelectVideo: (video: Video) => void;
  currentVideo: Video | null;
  onSelectPlaylist: (playlistId: string, title: string) => void;
}

type ChannelSubTab = "uploads" | "playlists" | "live";

export default function ChannelTab({
  channel,
  isLoading,
  onSelectVideo,
  currentVideo,
  onSelectPlaylist
}: ChannelTabProps) {
  const [activeTab, setActiveTab] = useState<ChannelSubTab>("uploads");

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="w-full h-28 md:h-36 rounded-2xl bg-slate-900 border border-slate-800" />
        
        {/* Channel Main Skeleton */}
        <div className="flex gap-4 items-center px-4">
          <div className="w-16 h-16 rounded-full bg-slate-900" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 bg-slate-900 rounded" />
            <div className="h-3 w-28 bg-slate-900 rounded" />
          </div>
        </div>

        {/* Tab List Skeleton */}
        <div className="h-10 w-full bg-slate-900 rounded-xl" />

        {/* List Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-20 bg-slate-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <User size={36} className="text-slate-650 mb-3" />
        <h3 className="font-sans font-bold text-sm text-slate-300">No Channel Context Loaded</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Click on a channel creator name inside search results or playlist cards to load their complete archive portfolio instantly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Banner Wrapper */}
      <div className="relative w-full h-24 md:h-36 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900">
        <img
          src={channel.bannerUrl}
          alt={channel.name}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      </div>

      {/* Profile Info block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-2 px-1">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/80 bg-slate-950 shadow-lg flex-shrink-0">
            <img
              src={channel.avatarUrl}
              alt={channel.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="font-sans font-bold text-lg md:text-xl text-slate-100 flex items-center gap-1.5">
              {channel.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
              <span className="text-indigo-400 font-semibold">{channel.subscriberCount}</span>
              <span>•</span>
              <span className="font-mono text-[10px] tracking-wider text-slate-500">ID: {channel.id.slice(0, 10)}...</span>
            </div>
          </div>
        </div>

        {/* Bio description segment */}
        {channel.description && (
          <div className="max-w-md p-3 rounded-xl bg-slate-900/50 border border-slate-800/40 text-[11px] leading-relaxed text-slate-400 flex gap-2">
            <Info size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>{channel.description}</div>
          </div>
        )}
      </div>

      {/* Internal channel catalog subtabs selector */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800/80 overflow-x-auto scroller-none">
        <button
          onClick={() => setActiveTab("uploads")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
            activeTab === "uploads"
              ? "bg-slate-800 text-slate-100 border-b border-indigo-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Film size={14} />
          Uploads ({channel.uploads?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("playlists")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
            activeTab === "playlists"
              ? "bg-slate-800 text-slate-100 border-b border-indigo-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Disc size={14} />
          Playlists ({channel.playlists?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
            activeTab === "live"
              ? "bg-slate-800 text-slate-100 border-b border-indigo-500 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
          }`}
        >
          <Radio size={14} />
          Live ({channel.liveStreams?.length || 0})
        </button>
      </div>

      {/* Grid displays based on selected active subtab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === "uploads" && (
          !channel.uploads || channel.uploads.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-500 text-xs font-medium">No uploads found.</div>
          ) : (
            channel.uploads.map(video => (
              <VideoCard
                key={`ch-up-${video.id}`}
                video={video}
                onClick={onSelectVideo}
                isActive={currentVideo?.id === video.id}
              />
            ))
          )
        )}

        {activeTab === "live" && (
          !channel.liveStreams || channel.liveStreams.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-500 text-xs font-medium">No active or archived livestreams found.</div>
          ) : (
            channel.liveStreams.map(video => (
              <VideoCard
                key={`ch-lv-${video.id}`}
                video={video}
                onClick={onSelectVideo}
                isActive={currentVideo?.id === video.id}
              />
            ))
          )
        )}

        {activeTab === "playlists" && (
          !channel.playlists || channel.playlists.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-500 text-xs font-medium">No playlists curated on this channel.</div>
          ) : (
            channel.playlists.map(pl => (
              <div
                key={`ch-pl-${pl.id}`}
                onClick={() => onSelectPlaylist(pl.id, pl.title)}
                className="group flex items-center gap-3.5 p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 cursor-pointer hover:border-slate-750 transition-all duration-300"
              >
                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                  <img src={pl.thumbnailUrl} alt={pl.title} className="w-full h-full object-cover" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-indigo-300 border-l border-slate-800">
                    <Disc size={12} className="animate-spin duration-3000" />
                    <span className="font-mono text-[9px] font-bold mt-1">{pl.itemCount}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-sans font-bold text-xs md:text-sm text-slate-100 truncate group-hover:text-white transition-colors">{pl.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{pl.channelName} curation</p>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Easy clean pagination footer context */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-4 text-[10px] font-mono text-slate-500">
        <div>YTWeb Pagination Engine v1.0</div>
        <div>Page 1 of 1 • Indexed Real-Time</div>
      </div>
    </div>
  );
}
