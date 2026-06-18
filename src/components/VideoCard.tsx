import React from "react";
import { Video } from "../types";
import { Play } from "lucide-react";

interface VideoCardProps {
  key?: any;
  video: Video;
  onClick: (video: Video) => void;
  isActive?: boolean;
}

export default function VideoCard({ video, onClick, isActive = false }: VideoCardProps) {
  // Safe extraction of initials for channel placeholder icon
  const firstLetter = String(video.channelName || "Y").charAt(0).toUpperCase();
  const avatarSeed = encodeURIComponent(video.channelName || "creator");
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=1e1b4b,311042,111827&fontWeight=600`;

  return (
    <div
      onClick={() => onClick(video)}
      className="group flex flex-col gap-2.5 w-full cursor-pointer transition-all duration-300"
    >
      {/* Thumbnail Block */}
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden hs-bg-card border transition-all duration-300 ${
        isActive 
          ? "border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500/30" 
          : "border-zinc-800/10 hs-border/10 group-hover:border-zinc-700/80 group-hover:shadow-lg group-hover:shadow-black/20"
      }`}>
        <img
          src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Play Icon Overlap on Hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="p-3 rounded-full bg-red-600 text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play size={16} fill="#ffffff" />
          </div>
        </div>

        {/* Video Duration / Live Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 font-mono text-[10px] text-zinc-100 tracking-wide font-medium scale-95">
          {video.isLive ? (
            <span className="text-red-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              LIVE
            </span>
          ) : (
            <span>{video.duration}</span>
          )}
        </div>
      </div>

      {/* Info Context (YouTube Style) */}
      <div className="flex gap-3 px-1">
        {/* Channel Avatar Circle */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full hs-bg-card overflow-hidden border border-zinc-800/10 hs-border/10">
          <img
            src={avatarUrl}
            alt={video.channelName || "Avatar"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Text Context */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <h4 className={`font-sans font-medium text-13px leading-tight line-clamp-2 transition-colors ${
            isActive ? "text-red-500 font-semibold" : "text-[var(--theme-text)] group-hover:text-red-500"
          }`} title={video.title}>
            {video.title}
          </h4>

          <div className="flex flex-col text-[11px] opacity-80 mt-1">
            <span className="hover:text-red-500 font-medium truncate flex items-center gap-1 transition-colors">
              {video.channelName}
            </span>
            <div className="flex items-center gap-1 mt-0.5 opacity-60 font-normal">
              <span>{video.views}</span>
              <span>•</span>
              <span>{video.publishedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
