import React, { useMemo, useState } from "react";
import { Video } from "./types";

const legacyVideos: Video[] = [
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio - Beats to relax/study to",
    channelName: "Lofi Girl",
    channelId: "UCocg_S_MO7Geq17g",
    publishedAt: "LIVE NOW",
    duration: "LIVE",
    views: "45K watching",
    thumbnailUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    isLive: true,
    description: "Relaxing beats ideal for work, study, or chill sessions."
  },
  {
    id: "4xDzrJKXOOY",
    title: "SYNTHWAVE radio - retro cyberpunk beats to cruise/code to",
    channelName: "Lofi Girl Synthwave",
    channelId: "UCocg_S_MO7Geq17g",
    publishedAt: "LIVE NOW",
    duration: "LIVE",
    views: "5.4K watching",
    thumbnailUrl: "https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    isLive: true,
    description: "Immersive synthwave radio for programmers and night drivers."
  },
  {
    id: "W-fFHeTX70Q",
    title: "Chopin - Nocturnes Full Album with Beautiful Landscapes",
    channelName: "Classical Symphony",
    channelId: "UC_U2D_M8-A3vGg0vV8PjY9A",
    publishedAt: "2 years ago",
    duration: "1:48:20",
    views: "12M views",
    thumbnailUrl: "https://img.youtube.com/vi/W-fFHeTX70Q/hqdefault.jpg",
    description: "Relaxing classical study music and piano nocturnes."
  },
  {
    id: "5_7Iuj3DToE",
    title: "Cozy Autumn Rain in the Cozy Cabin - Rain Sounds",
    channelName: "Cozy Rain",
    channelId: "UCrP-u75Zz6ySefU3vL3Xk2A",
    publishedAt: "3 months ago",
    duration: "3:00:00",
    views: "240K views",
    thumbnailUrl: "https://img.youtube.com/vi/5_7Iuj3DToE/hqdefault.jpg",
    description: "Rain sounds for sleeping and studying."
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up Official Music Video",
    channelName: "Rick Astley",
    channelId: "UCuAXFkgcl1yWXWcOD56qy_Q",
    publishedAt: "16 years ago",
    duration: "3:33",
    views: "1.5B views",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    description: "Official music video."
  }
];

const legacySuggestions = [
  "lofi hip hop radio",
  "synthwave radio",
  "chopin piano",
  "rain sounds",
  "official music video"
];

function filterVideos(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return legacyVideos;
  const matches = legacyVideos.filter((video) => {
    const haystack = `${video.title} ${video.channelName} ${video.description || ""}`.toLowerCase();
    return haystack.indexOf(term) !== -1;
  });
  return matches.length > 0 ? matches : legacyVideos;
}

export default function LegacyApp() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const results = useMemo(() => filterVideos(submittedQuery), [submittedQuery]);
  const matchingSuggestions = legacySuggestions.filter((item) =>
    query.trim() ? item.toLowerCase().indexOf(query.trim().toLowerCase()) !== -1 : true
  );

  const runSearch = (nextQuery?: string) => {
    const searchTerm = typeof nextQuery === "string" ? nextQuery : query;
    setQuery(searchTerm);
    setSubmittedQuery(searchTerm);
    setCurrentVideo(null);
  };

  return (
    <div className="legacy-page">
      <header className="legacy-header">
        <div className="legacy-brand">YouTubeDesktop</div>
        <form
          className="legacy-search"
          onSubmit={(event) => {
            event.preventDefault();
            runSearch();
          }}
        >
          <input
            aria-label="Search videos"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search videos"
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <main className="legacy-main">
        <section className="legacy-panel">
          <h1>iPad Safari Mode</h1>
          <p>This lightweight mode uses local results so search works on GitHub Pages and iOS 10 Safari.</p>
          <div className="legacy-suggestions">
            {matchingSuggestions.map((item) => (
              <button key={item} type="button" onClick={() => runSearch(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>

        {currentVideo && (
          <section className="legacy-player">
            <iframe
              title={currentVideo.title}
              src={`https://www.youtube.com/embed/${currentVideo.id}`}
              allowFullScreen
            />
            <h2>{currentVideo.title}</h2>
            <p>{currentVideo.channelName} - {currentVideo.views}</p>
          </section>
        )}

        <section className="legacy-results">
          <h2>{submittedQuery ? `Search results for "${submittedQuery}"` : "Recommended videos"}</h2>
          {results.map((video) => (
            <article key={video.id} className="legacy-card">
              <button type="button" onClick={() => setCurrentVideo(video)}>
                <img src={video.thumbnailUrl} alt={video.title} />
                <span className="legacy-card-title">{video.title}</span>
                <span>{video.channelName}</span>
                <span>{video.views} - {video.publishedAt}</span>
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
