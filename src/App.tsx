import React, { useState, useEffect, useRef } from "react";
import { Video, Channel, Playlist } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import VideoCard from "./components/VideoCard";
import LibraryTab from "./components/LibraryTab";
import ChannelTab from "./components/ChannelTab";
import PlaylistTab from "./components/PlaylistTab";
import { 
  Search, 
  Menu, 
  Mic, 
  Video as VideoIcon, 
  Bell, 
  Home, 
  Compass, 
  History, 
  Clock, 
  ThumbsUp, 
  Flame, 
  TrendingUp, 
  ShoppingBag, 
  Music, 
  Film, 
  Radio, 
  Gamepad2, 
  Newspaper, 
  Trophy, 
  Lightbulb, 
  Settings, 
  Flag, 
  HelpCircle, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  X,
  Heart,
  Play,
  ListMusic,
  Maximize2
} from "lucide-react";

type PrimaryTab = "discover" | "channel" | "playlist" | "library";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<PrimaryTab>("discover");

  // Playback playlist state controls
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [playlist, setPlaylist] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Search Engine state fields
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("video"); // video, channel, playlist, short, live
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [isSearchSearching, setIsSearchSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Channel Viewer state
  const [channelData, setChannelData] = useState<Channel | null>(null);
  const [isChannelLoading, setIsChannelLoading] = useState<boolean>(false);

  // Playlist state
  const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState<boolean>(false);

  // PWA offline local persistence states
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [watchHistory, setWatchHistory] = useState<Video[]>([]);
  const [playlistHistory, setPlaylistHistory] = useState<{ id: string; title: string; channelName: string; trackingDate: string }[]>([]);

  // UI States
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [showNotificationsToast, setShowNotificationsToast] = useState<boolean>(false);

  const suggestionRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Fixed lists for popular presets & search help suggestions
  const recomendationTags = [
    { label: "All", query: "" },
    { label: "Music", query: "trending music videos popular" },
    { label: "Lofi Beats", query: "lofi hip hop radio live study beats" },
    { label: "Gaming", query: "gaming stream walkthrough live gameplay" },
    { label: "Synthwave", query: "synthwave cyberpunk instrumental ambient" },
    { label: "Rain Ambiance", query: "fireplace cozy cabin rain sounds" },
    { label: "Classical Piano", query: "classical piano study chopin nocturnes solo" },
    { label: "Nature Flight", query: "misty forest aerial drone nature sounds" }
  ];

  const autocompleteSuggestions = [
    "lofi hip hop radio beats to study",
    "cozy fireplace setup ambient rain",
    "chillsynth retro tracks instrumental",
    "misty mountain flight aerial drone 4k",
    "classical piano works sleep chill",
    "deep undersea oceans nature sound",
    "official music video hits popular",
    "minecraft gameplay live broadcast",
    "coding study chill room synth"
  ];

  // Mock static Subscribed channel lists matching real YouTube content creators
  const initialSubscriptions = [
    { id: "UCocg_S_MO7Geq17g", name: "Lofi Girl", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Lofi%20Girl&backgroundColor=1e1b4b,311042" },
    { id: "UCq3Cg97Lp0Y7-Gj9gPl_tQw", name: "RetroWave Records", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RetroWave&backgroundColor=111827" },
    { id: "UC_U2D_M8-A3vGg0vV8PjY9A", name: "Classical Symphony", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Classical&backgroundColor=311042" },
    { id: "UCtZ6A6CWeXmJ_vB_T78_mYw", name: "Nature Escapes", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Nature&backgroundColor=1e1b4b" },
    { id: "UC_uVOnZJ_gqby9Qd6tB_I7g", name: "Undersea Cinema", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Undersea&backgroundColor=111827" },
    { id: "UCuAXFkgcl1yWXWcOD56qy_Q", name: "Rick Astley", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rick&backgroundColor=1e1b4b" }
  ];

  // 1. Initial State mount from LocalStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("ytweb_favorites");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedHist = localStorage.getItem("ytweb_history");
      if (storedHist) setWatchHistory(JSON.parse(storedHist));

      const storedPls = localStorage.getItem("ytweb_playlists");
      if (storedPls) setPlaylistHistory(JSON.parse(storedPls));

      const storedSearches = localStorage.getItem("ytweb_recent_searches");
      if (storedSearches) setRecentSearches(JSON.parse(storedSearches));
    } catch (e) {
      console.error("Local storage restoration failed:", e);
    }

    // Trigger an initial empty search to load recommended/pre-seeded lofi beats
    handleDispatchSearch("");
  }, []);

  // Listen for click-outside and collapse Suggestions popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch live search autocomplete guidelines with lightweight debounce
  useEffect(() => {
    const queryTerm = searchQuery.trim();
    if (!queryTerm) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(queryTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        console.error("Failing fetching API suggestions fallback:", err);
      }
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Sync favorites with local storage
  const syncFavorites = (newFavs: Video[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem("ytweb_favorites", JSON.stringify(newFavs));
    } catch (e) {
      console.error("Failed storing favorites:", e);
    }
  };

  // Sync watch logs to localStorage
  const syncWatchHistory = (newHist: Video[]) => {
    setWatchHistory(newHist);
    try {
      localStorage.setItem("ytweb_history", JSON.stringify(newHist));
    } catch (e) {
      console.error("Failed storing play history:", e);
    }
  };

  // Sync Visited Playlists to localStorage
  const syncPlaylistHistory = (newPls: { id: string; title: string; channelName: string; trackingDate: string }[]) => {
    setPlaylistHistory(newPls);
    try {
      localStorage.setItem("ytweb_playlists", JSON.stringify(newPls));
    } catch (e) {
      console.error("Failed storing playlist history:", e);
    }
  };

  // 2. Search execution trigger & store last 20 queries locally
  const handleDispatchSearch = async (overrideQuery?: string) => {
    const q = (typeof overrideQuery === "string" ? overrideQuery : searchQuery).trim();
    
    setIsSearchSearching(true);
    setShowSuggestions(false);

    // Save search query into history list (up to 20)
    if (q && !overrideQuery) {
      const filtered = recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase());
      const updated = [q, ...filtered].slice(0, 20);
      setRecentSearches(updated);
      try {
        localStorage.setItem("ytweb_recent_searches", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to store searches", err);
      }
    }

    try {
      const url = q 
        ? `/api/search?q=${encodeURIComponent(q)}&type=${searchType}` 
        : `/api/search?type=${searchType}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Search service offline");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearchSearching(false);
    }
  };

  // Clear single or all recent search items
  const handleClearSearchHistory = (txt?: string) => {
    let next: string[] = [];
    if (txt) {
      next = recentSearches.filter(item => item !== txt);
    }
    setRecentSearches(next);
    try {
      localStorage.setItem("ytweb_recent_searches", JSON.stringify(next));
    } catch (err) {
      console.error("Failed storing recent searches", err);
    }
  };

  // 3. Channel selection trigger
  const handleSelectChannel = async (channelId: string, channelName: string) => {
    setActiveTab("channel");
    setIsChannelLoading(true);
    setChannelData(null);
    try {
      const res = await fetch(`/api/channel/${channelId}?name=${encodeURIComponent(channelName)}`);
      if (!res.ok) throw new Error("Channel detail request failed");
      const data = await res.json();
      setChannelData(data);
    } catch (err) {
      console.error("Failed loading channel content:", err);
    } finally {
      setIsChannelLoading(false);
    }
  };

  // 4. Playlist Selection trigger
  const handleSelectPlaylist = async (playlistId: string, playlistTitle: string) => {
    setActiveTab("playlist");
    setIsPlaylistLoading(true);
    setPlaylistData(null);
    try {
      const res = await fetch(`/api/playlist/${playlistId}?title=${encodeURIComponent(playlistTitle)}`);
      if (!res.ok) throw new Error("Playlist tracks request failed");
      const data = await res.json();
      setPlaylistData(data);

      const exists = playlistHistory.some(p => p.id === playlistId);
      if (!exists) {
        const next = [
          {
            id: playlistId,
            title: playlistTitle,
            channelName: "Curator Archive",
            trackingDate: new Date().toLocaleDateString()
          },
          ...playlistHistory
        ].slice(0, 10);
        syncPlaylistHistory(next);
      }
    } catch (err) {
      console.error("Failed fetching playlist:", err);
    } finally {
      setIsPlaylistLoading(false);
    }
  };

  // 5. Playback initiation logic
  const handlePlayVideo = (video: Video, groupSet?: Video[]) => {
    setCurrentVideo(video);
    setActiveTab("discover"); // Switch back to discover view to stage the video player

    const activeSet = groupSet && groupSet.length > 0 ? groupSet : [video];
    setPlaylist(activeSet);

    const index = activeSet.findIndex(v => v.id === video.id);
    setCurrentIndex(index >= 0 ? index : 0);

    const filteredHist = watchHistory.filter(v => v.id !== video.id);
    const nextHist = [video, ...filteredHist].slice(0, 30);
    syncWatchHistory(nextHist);

    // Scroll main viewport container to top for immediate video stage focus
    setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const handleNextTrack = () => {
    if (playlist.length <= 1) return;
    let nextIdx = currentIndex;

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else {
      nextIdx = (currentIndex + 1) % playlist.length;
    }

    setCurrentIndex(nextIdx);
    setCurrentVideo(playlist[nextIdx]);
  };

  const handlePrevTrack = () => {
    if (playlist.length <= 1) return;
    let prevIdx = currentIndex;

    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * playlist.length);
    } else {
      prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    }

    setCurrentIndex(prevIdx);
    setCurrentVideo(playlist[prevIdx]);
  };

  // Favorites trigger handler
  const handleToggleFavorite = (video: Video) => {
    const isFav = favorites.some(v => v.id === video.id);
    if (isFav) {
      syncFavorites(favorites.filter(v => v.id !== video.id));
    } else {
      syncFavorites([...favorites, video]);
    }
  };

  const handleClearHistory = () => {
    syncWatchHistory([]);
  };

  const handleClearFavorites = () => {
    syncFavorites([]);
  };

  // Filter suggestion autocomplete matches dynamically
  const filteredSuggestions = searchQuery.trim()
    ? (suggestions.length > 0 ? suggestions : autocompleteSuggestions.filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase()) && s.toLowerCase() !== searchQuery.toLowerCase()
      ))
    : autocompleteSuggestions;

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col bg-[#0f0f0f] selection:bg-red-500/20">
      
      {/* 1. YOUTUBE TOP FIXED HEADER BAR */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-zinc-800/80 px-4 py-2.5 shadow-md flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Brand Logo */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-white hover:bg-zinc-800 p-2 rounded-full cursor-pointer transition-colors"
            title="Toggle Menu"
            id="sidebar-toggle-btn"
          >
            <Menu size={20} />
          </button>
          
          <div 
            onClick={() => {
              setCurrentVideo(null);
              setActiveTab("discover");
              setSearchQuery("");
              setActiveCategory("All");
              handleDispatchSearch("");
            }}
            className="flex items-center gap-1.5 cursor-pointer group select-none"
            id="brand-logo-container"
          >
            <div className="w-7.5 h-5 bg-red-600 rounded-md flex items-center justify-center text-white relative shadow-md group-hover:bg-red-500 transition-colors">
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-white ml-0.5" />
            </div>
            <h1 className="font-sans font-bold text-base tracking-tight text-white flex items-center leading-none">
              YouTube<sub className="text-[9px] font-medium text-zinc-400 font-mono tracking-wider ml-1 uppercase">Desktop</sub>
            </h1>
          </div>
        </div>

        {/* Center: Search pill box + Microphone icon */}
        <div className="flex-1 max-w-xl relative flex items-center gap-3" ref={suggestionRef}>
          <div className="flex items-center flex-1 bg-[#121212] border border-zinc-800 rounded-full px-4 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all gap-2 shadow-inner.">
            <Search size={14} className="text-zinc-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search videos, channels, playlists..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setActiveTab("discover");
                  handleDispatchSearch();
                }
              }}
              className="bg-transparent text-xs text-zinc-105 focus:outline-none w-full"
              id="main-video-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  handleDispatchSearch("");
                }} 
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => {
              setActiveTab("discover");
              handleDispatchSearch();
            }}
            className="bg-zinc-800 hover:bg-zinc-700 border-l border-zinc-800 text-zinc-300 px-6 py-2 rounded-r-full transition-colors cursor-pointer"
            title="Search"
            id="main-search-submit-btn"
          >
            <Search size={14} />
          </button>

          <button 
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-100 hidden sm:block transition-all cursor-pointer"
            title="Search with your voice"
          >
            <Mic size={14} />
          </button>

          {/* Autocomplete Dynamic Match Dropdown */}
          {showSuggestions && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
            <div className="absolute top-12 left-0 right-0 bg-[#0f0f0f] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 p-2 animate-fade-in text-xs">
              {recentSearches.length > 0 && (
                <div className="flex flex-col mb-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold px-3 py-1 tracking-wider uppercase">
                    <span>Recent Searches</span>
                    <button 
                      onClick={() => handleClearSearchHistory()} 
                      className="text-red-500 hover:underline hover:text-red-400"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((keyword, i) => (
                    <div 
                      key={`recent-kw-${i}`} 
                      className="flex items-center justify-between hover:bg-zinc-800 rounded-lg px-3 py-1.5 cursor-pointer text-zinc-300 hover:text-white group"
                    >
                      <span 
                        onClick={() => {
                          setSearchQuery(keyword);
                          setActiveTab("discover");
                          handleDispatchSearch(keyword);
                        }}
                        className="flex-1"
                      >
                        ⏱ {keyword}
                      </span>
                      <button 
                        onClick={() => handleClearSearchHistory(keyword)} 
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-700 rounded text-zinc-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {filteredSuggestions.length > 0 && (
                <div>
                  <div className="text-[10px] text-zinc-500 font-bold px-3 py-1 tracking-wider uppercase border-t border-zinc-900 pt-2">Suggestions</div>
                  {filteredSuggestions.map((item, id) => (
                    <div
                      key={`suggest-${id}`}
                      onClick={() => {
                        setSearchQuery(item);
                        setActiveTab("discover");
                        handleDispatchSearch(item);
                      }}
                      className="px-3 py-2 hover:bg-zinc-800 active:bg-zinc-700 rounded-lg cursor-pointer text-zinc-300 hover:text-white transition-colors"
                    >
                      🔍 {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: + Create, Notification, User circular placeholder */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <button 
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-350 hover:text-white transition-colors hidden md:block cursor-pointer"
            title="Create video"
          >
            <VideoIcon size={16} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsEnabled(!notificationsEnabled);
                setShowNotificationsToast(true);
                setTimeout(() => setShowNotificationsToast(false), 3000);
              }}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-350 hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              {notificationsEnabled && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-650 rounded-full ring-2 ring-[#0f0f0f] animate-pulse" />
              )}
            </button>
          </div>

          <div className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-xs font-bold font-sans text-white border border-red-500/20 shadow-md cursor-pointer uppercase select-none">
            A
          </div>
        </div>
      </header>

      {/* NOTIFICATION TOAST ELEMENT */}
      {showNotificationsToast && (
        <div className="fixed bottom-16 right-4 bg-zinc-900 border border-zinc-800 text-xs px-4 py-2.5 rounded-xl shadow-2xl z-50 text-white flex items-center gap-2 animate-bounce">
          <span>🔔 Notifications {notificationsEnabled ? "Enabled" : "Muted"}</span>
        </div>
      )}

      {/* 2. MAIN CONTAINER LAYOUT */}
      <div className="flex flex-1 min-h-0">
        
        {/* LEFT NAVIGATION DRAWER RAIL (Styled exactly like desktop YouTube) */}
        <aside className={`bg-[#0f0f0f] flex-shrink-0 flex flex-col border-r border-zinc-90 w-24 border-zinc-900 overflow-y-auto select-none p-2 ${
          isSidebarCollapsed ? "w-20" : "w-[240px]"
        } hidden md:flex transition-all duration-300`}>
          
          {/* Main group block */}
          <button 
            onClick={() => {
              setActiveTab("discover");
              setCurrentVideo(null); // click Home to go back to grid
              setActiveCategory("All");
              setSearchQuery("");
              handleDispatchSearch("");
            }}
            className={`flex ${isSidebarCollapsed ? "flex-col items-center justify-center p-3 text-[10px]" : "items-center gap-5 px-4 py-2.5 text-sm"} rounded-xl transition-all cursor-pointer font-medium ${
              activeTab === "discover" && !currentVideo
                ? "bg-zinc-800 font-bold text-white shadow-md shadow-black/20" 
                : "hover:bg-zinc-900 text-zinc-300 hover:text-white"
            }`}
          >
            <Home size={18} className={activeTab === "discover" && !currentVideo ? "text-red-500" : "text-zinc-400"} />
            <span>Home</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab("library");
            }}
            className={`flex ${isSidebarCollapsed ? "flex-col items-center justify-center p-3 text-[10px]" : "items-center gap-5 px-4 py-2.5 text-sm"} rounded-xl transition-all cursor-pointer font-medium ${
              activeTab === "library"
                ? "bg-zinc-800 font-bold text-white shadow-md shadow-black/20" 
                : "hover:bg-zinc-900 text-zinc-300 hover:text-white"
            }`}
          >
            <History size={18} className={activeTab === "library" ? "text-red-500" : "text-zinc-400"} />
            <span>Library & Logs</span>
          </button>

          {!isSidebarCollapsed && (
            <>
              <div className="h-[1px] bg-zinc-900 my-3 mx-2" />
              
              {/* Dynamic Bookmarks/Favorites indicators */}
              <div className="px-4 py-1.5 text-[10px] font-bold text-zinc-500 tracking-wider">OFFLINE SAVED</div>
              
              <button 
                onClick={() => {
                  setActiveTab("library");
                }}
                className="flex items-center gap-5 px-4 py-2 bg-zinc-900/40 hover:bg-zinc-900 text-xs text-zinc-300 rounded-xl transition-colors cursor-pointer"
              >
                <Heart size={14} className="text-pink-500 shrink-0" fill="currentColor" />
                <span className="truncate">{favorites.length} saved streams</span>
              </button>

              <div className="h-[1px] bg-zinc-900 my-3 mx-2" />

              {/* Subscriptions channel segment */}
              <div className="px-4 py-1.5 text-[10px] font-bold text-zinc-500 tracking-wider">SUBSCRIPTIONS</div>
              
              <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto mt-1 px-1">
                {initialSubscriptions.map((subChan) => (
                  <button
                    key={`side-sub-${subChan.id}`}
                    onClick={() => handleSelectChannel(subChan.id, subChan.name)}
                    className="flex items-center gap-3.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl text-left truncate transition-all cursor-pointer"
                  >
                    <img
                      src={subChan.avatar}
                      alt={subChan.name}
                      className="w-5.5 h-5.5 rounded-full object-cover flex-shrink-0"
                    />
                    <span className="truncate flex-1 font-medium">{subChan.name}</span>
                    <span className="w-1.5 h-1.5 bg-red-650 rounded-full" />
                  </button>
                ))}
              </div>

              <div className="h-[1px] bg-zinc-900 my-3 mx-2" />

              {/* Explore category block */}
              <div className="px-4 py-1.5 text-[10px] font-bold text-zinc-500 tracking-wider">EXPLORE</div>
              {[
                { label: "Trending", value: "trending high views video hits" },
                { label: "Shopping", value: "promotional shopping gadgets tech" },
                { label: "Music", value: "popular musical tracks top hit lists" },
                { label: "Movies & Films", value: "theatre film cinematic trailer compilation" },
                { label: "Live streams", value: "live interactive live radio camera" },
                { label: "Gaming broadcasts", value: "interactive gaming play walkthrough stream" },
                { label: "News feeds", value: "breaking news informational update broadcast" }
              ].map((ex) => (
                <button
                  key={`explore-lbl-${ex.label}`}
                  onClick={() => {
                    setActiveTab("discover");
                    setCurrentVideo(null);
                    setSearchQuery(ex.label);
                    handleDispatchSearch(ex.value);
                  }}
                  className="flex items-center gap-5 px-4 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors text-left"
                >
                  <span className="text-zinc-500">•</span>
                  <span>{ex.label}</span>
                </button>
              ))}

              <div className="h-[1px] bg-zinc-900 my-3 mx-2" />

              {/* More settings segment */}
              <div className="flex flex-col gap-0.5 px-1 py-1">
                <button 
                  onClick={() => alert("Settings is synchronized in local engine storage.")}
                  className="flex items-center gap-4 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => alert("Report tool completed successfully.")}
                  className="flex items-center gap-4 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                >
                  <Flag size={14} />
                  <span>Report history</span>
                </button>
                <button 
                  onClick={() => alert("Support desk is active at support@ytweb.com")}
                  className="flex items-center gap-4 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
                >
                  <HelpCircle size={14} />
                  <span>Help</span>
                </button>
              </div>

              {/* Collapsed copyright notes */}
              <div className="px-4 py-4 text-[10px] text-zinc-650 leading-relaxed font-sans border-t border-zinc-900/60 mt-3">
                <p>© 2026 YouTube Desktop Clone</p>
                <p className="mt-1">Built with React, Vite, Tailwind CSS</p>
              </div>

            </>
          )}
        </aside>

        {/* MOBILE NAVIGATION BAR AT BOTTOM (Clean & Simple fallback for portable setups) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f] border-t border-zinc-900 py-2 px-3 flex items-center justify-around text-[10px] text-zinc-400 backdrop-blur-md shadow-2xl">
          <button 
            onClick={() => {
              setActiveTab("discover");
              setCurrentVideo(null); // Return to home grid on press
            }} 
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeTab === "discover" && !currentVideo ? "text-red-500 font-bold" : "text-zinc-400"}`}
          >
            <Home size={16} />
            <span>Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("library")} 
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeTab === "library" ? "text-red-500 font-bold" : "text-zinc-400"}`}
          >
            <History size={16} />
            <span>Library</span>
          </button>
          
          <button 
            onClick={() => {
              // Select first subscription lofi girl channel as fallback
              handleSelectChannel("UCocg_S_MO7Geq17g", "Lofi Girl");
            }} 
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeTab === "channel" ? "text-red-500 font-bold" : "text-zinc-400"}`}
          >
            <Music size={16} />
            <span>Channels</span>
          </button>

          <button 
            onClick={() => {
              // Trigger lofi girl live playlist as default fallback
              handleSelectPlaylist("PLofm7mS00YkhM9XbUuLzI_TqV5_T3z6-s", "Lofi Beats Collection");
            }} 
            className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${activeTab === "playlist" ? "text-red-500 font-bold" : "text-zinc-400"}`}
          >
            <ListMusic size={16} />
            <span>Playlists</span>
          </button>
        </nav>

        {/* 3. MAIN INNER CONTENT SCROLLER VIEW */}
        <main ref={mainRef} className={`flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 flex flex-col min-w-0 ${
          activeTab === "discover" ? "pb-24" : "pb-16 md:pb-6"
        }`}>
          
          {/* THEATRE / DIRECT WATCH PAGE VIEW (Visible and kept fully mounted for seamless PiP playback) */}
          {currentVideo && (
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full ${activeTab === "discover" ? "animate-fade-in" : "pointer-events-none absolute top-[-9999px] left-[-9999px] opacity-0"}`}>
              
              {/* Grand video screen on Left column (wide) */}
              <section className="lg:col-span-8 flex flex-col gap-4 pointer-events-auto">
                <div className={activeTab === "discover" ? "w-full" : "fixed bottom-20 md:bottom-6 right-4 w-[280px] sm:w-[320px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col hover:border-red-500/20 duration-300 pointer-events-auto"}>
                  <VideoPlayer
                    currentVideo={currentVideo}
                    playlist={playlist}
                    currentIndex={currentIndex}
                    isShuffle={isShuffle}
                    onNext={handleNextTrack}
                    onPrev={handlePrevTrack}
                    onToggleShuffle={() => setIsShuffle(!isShuffle)}
                    onSelectVideo={(video) => handlePlayVideo(video, playlist)}
                    isMini={activeTab !== "discover"}
                    onCloseMini={() => setCurrentVideo(null)}
                    onMaximize={() => setActiveTab("discover")}
                  />
                </div>

                {/* Styled Channel action bar under player */}
                <div className="p-4 bg-zinc-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-650 flex items-center justify-center text-sm font-bold text-white ring-2 ring-red-500/20 flex-shrink-0 uppercase select-none font-mono">
                      {currentVideo.channelName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span 
                        onClick={() => handleSelectChannel(currentVideo.channelId, currentVideo.channelName)}
                        className="text-sm font-bold text-zinc-100 hover:text-red-500 cursor-pointer transition-colors truncate"
                      >
                        {currentVideo.channelName}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-sans mt-0.5">1.54M subscribers</span>
                    </div>

                    <button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className={`ml-4 px-4.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                        isSubscribed 
                          ? "bg-zinc-850 text-zinc-400 border border-zinc-800 hover:bg-zinc-800" 
                          : "bg-red-650 hover:bg-red-650 text-white shadow-lg active:scale-95"
                      }`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Add to bookmark action button */}
                    <button
                      onClick={() => handleToggleFavorite(currentVideo)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold font-sans transition-all active:scale-95 cursor-pointer ${
                        favorites.some(f => f.id === currentVideo.id)
                          ? "bg-pink-950/40 border-pink-500/40 text-pink-400"
                          : "bg-zinc-805 border-zinc-800 text-zinc-350 hover:bg-zinc-750"
                      }`}
                    >
                      <Heart
                        size={14}
                        fill={favorites.some(f => f.id === currentVideo.id) ? "#f43f5e" : "none"}
                        className={favorites.some(f => f.id === currentVideo.id) ? "animate-pulse" : ""}
                      />
                      <span>{favorites.some(f => f.id === currentVideo.id) ? "Saved" : "Save offline"}</span>
                    </button>

                    <button
                      onClick={() => handleSelectChannel(currentVideo.channelId, currentVideo.channelName)}
                      className="px-4 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-700"
                    >
                      Visit Channel
                    </button>

                    {/* Back to Home grid button */}
                    <button
                      onClick={() => {
                        setCurrentVideo(null);
                        setActiveCategory("All");
                        setSearchQuery("");
                        handleDispatchSearch("");
                      }}
                      className="px-4 py-1.5 rounded-full bg-red-650/10 border border-red-500/20 text-red-500 hover:bg-red-650/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Back to Grid
                    </button>
                  </div>
                </div>

                {/* Collapsible/Rich video descriptions node block */}
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-300 leading-relaxed shadow-inner">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold mb-1 border-b border-zinc-800 pb-2">
                    <span>{currentVideo.views || "120K views"}</span>
                    <span>•</span>
                    <span>{currentVideo.publishedAt || "Recently Published"}</span>
                  </div>
                  <p className="whitespace-pre-line text-zinc-400 mt-2 font-light">
                    {currentVideo.description || "Stream directly from dynamic high-speed YouTube node content servers. Lightweight container player optimized for stable frame-rate output."}
                  </p>
                </div>
              </section>

              {/* Related / Up-Next column list on Right sidebar (desktop) */}
              <section className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 px-1 text-xs text-zinc-400 font-bold tracking-tight">
                  <span className="uppercase">Related / Up Next</span>
                  <span>{playlist.length} streams</span>
                </div>

                <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1">
                  {playlist.map((video, idx) => {
                    const isActive = currentVideo.id === video.id;
                    return (
                      <div 
                        key={`rel-${video.id}-${idx}`}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer group ${
                          isActive 
                            ? "bg-zinc-800/80 border border-zinc-700" 
                            : "hover:bg-zinc-900/60"
                        }`}
                        onClick={() => handlePlayVideo(video, playlist)}
                      >
                        {/* Smaller standard landscape layout thumbnail */}
                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-800">
                          <img
                            src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute bottom-1 right-1 px-1 rounded bg-black/85 font-mono text-[9px] text-zinc-100 font-semibold">
                            {video.isLive ? "LIVE" : video.duration}
                          </div>
                        </div>

                        {/* Text Metadata right aligned */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5 mt-0.5">
                          <h4 
                            className={`text-xs font-semibold leading-normal line-clamp-2 transition-colors ${
                              isActive ? "text-red-500 font-bold" : "text-zinc-100 group-hover:text-red-400"
                            }`}
                            title={video.title}
                          >
                            {video.title}
                          </h4>
                          <span className="text-[10px] text-zinc-400 truncate mt-1">
                            {video.channelName}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-normal">
                            {video.views} • {video.publishedAt}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>
          )}

          {/* ALL OTHER WORKS CHANNELS TABS (Visible if no video is loaded or we are browsing other screens) */}
          {(!currentVideo || activeTab !== "discover") && (
            <div className="flex flex-col gap-6 w-full animate-fade-in">
              
              {/* Category tag horizontal chips stream bar (rendered exclusively on discover tab) */}
              {activeTab === "discover" && (
                <div className="flex items-center gap-2 overflow-x-auto scroller-none py-1 border-b border-zinc-900 pb-3">
                  {recomendationTags.map(tag => {
                    const isSelected = activeCategory === tag.label;
                    return (
                      <button
                        key={tag.label}
                        onClick={() => {
                          setActiveCategory(tag.label);
                          setSearchQuery(tag.query ? tag.label : "");
                          setSearchType("video");
                          handleDispatchSearch(tag.query);
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-white text-black border border-white font-bold"
                            : "bg-zinc-800 border border-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 1. DISCOVER / SEARCH GRID PANEL */}
              {activeTab === "discover" && (
                <div className="flex flex-col gap-6">
                  


                  {/* Wide-screen landscape responsive grids of videos */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <h3 className="font-sans font-bold text-xs text-zinc-400 uppercase tracking-wider">
                        {activeCategory === "All" && !searchQuery ? "Recommended Feed" : `Search Results: "${searchQuery || activeCategory}"`} ({searchResults.length})
                      </h3>
                    </div>

                    {isSearchSearching ? (
                      /* YouTube Style Beautiful Skeletons */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <div key={`skel-home-${n}`} className="flex flex-col gap-2.5 w-full">
                            <div className="skeleton-pulse rounded-xl aspect-video w-full" />
                            <div className="flex gap-3 px-1 mt-1">
                              <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
                              <div className="flex-1 flex flex-col gap-1.5">
                                <div className="h-3 bg-zinc-800 rounded w-4/5" />
                                <div className="h-2 bg-zinc-800 rounded w-2/3 mt-1" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchResults.length === 0 ? (
                      /* Zero state block */
                      <div className="p-20 rounded-3xl bg-zinc-900/35 border border-zinc-850 text-center flex flex-col items-center justify-center">
                        <Compass className="text-zinc-700 animate-spin duration-10000 mb-4" size={40} />
                        <p className="text-zinc-200 text-base font-bold">Search index returned empty</p>
                        <p className="text-xs text-zinc-500 max-w-sm mt-1.5 leading-relaxed font-light">
                          Try searching for keywords like "chopin piano", "lofi girls study radio", or click our category sidebar filters!
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-8">
                        {/* Standard YouTube Home landscape card grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 mt-1">
                          {searchResults.map((video, idx) => {
                            const isActive = currentVideo?.id === video.id;
                            return (
                              <VideoCard
                                key={`home-card-${video.id}-${idx}`}
                                video={video}
                                onClick={(selected) => handlePlayVideo(selected, searchResults)}
                                isActive={isActive}
                              />
                            );
                          })}
                        </div>


                        
                        {/* More Playlists Section */}
                        {searchResults.length > 0 && searchQuery === "" && (
                          <div className="border-t border-zinc-900 pt-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-white font-sans font-bold text-sm tracking-tight px-1 uppercase">
                              <ListMusic className="text-zinc-400 shrink-0" size={18} />
                              <span>Featured Playlists Album Compilation</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                              {[
                                { id: "PLofm7mS00YkhM9XbUuLzI_TqV5_T3z6-s", title: "Lofi Beats Study Radio Album", channelName: "Lofi Girl", count: 8 },
                                { id: "PL9u7d_AOM8-A3vGg0vV8PjY9AM8vLz_I", title: "Retro synthwave chillsynth", channelName: "RetroWave Records", count: 12 },
                                { id: "PLrP-u75Zz6ySefU3vL3Xk2ArP-uLzXkU", title: "Warm winter fireplace acoustic ambient", channelName: "Ambiance Cinema", count: 10 }
                              ].map((pl, idx) => (
                                <div 
                                  key={`playlist-feat-${idx}`}
                                  onClick={() => handleSelectPlaylist(pl.id, pl.title)}
                                  className="group flex gap-4 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors"
                                >
                                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-zinc-800">
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-black/85 flex flex-col justify-center items-center text-[10px] text-zinc-300 z-20 font-bold border-l border-zinc-800">
                                      <span>{pl.count}</span>
                                      <span className="text-[7px] uppercase mt-0.5">Vids</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-xs font-semibold text-white group-hover:text-red-500 truncate">{pl.title}</h4>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">By {pl.channelName}</p>
                                    <p className="text-[9px] font-mono text-zinc-500 mt-1">🏷 Playlist Curator</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. CHANNEL DETAILED VIEWER PANEL */}
              {activeTab === "channel" && (
                <ChannelTab
                  channel={channelData}
                  isLoading={isChannelLoading}
                  onSelectVideo={(video) => handlePlayVideo(video, channelData?.uploads || [])}
                  currentVideo={currentVideo}
                  onSelectPlaylist={handleSelectPlaylist}
                />
              )}

              {/* 3. PLAYLISTS MANAGER PANEL */}
              {activeTab === "playlist" && (
                <PlaylistTab
                  playlist={playlistData}
                  isLoading={isPlaylistLoading}
                  onSelectVideo={(video) => handlePlayVideo(video, playlistData?.videos || [])}
                  currentVideo={currentVideo}
                  onLoadEntirePlaylist={(videos) => {
                    if (videos.length > 0) {
                      handlePlayVideo(videos[0], videos);
                    }
                  }}
                />
              )}

              {/* 4. LOCAL STORAGE HISTORIC LIBRARY TABS */}
              {activeTab === "library" && (
                <LibraryTab
                  favorites={favorites}
                  watchHistory={watchHistory}
                  playlistHistory={playlistHistory}
                  onSelectVideo={(video) => handlePlayVideo(video, [video])}
                  currentVideo={currentVideo}
                  onClearHistory={handleClearHistory}
                  onClearFavorites={handleClearFavorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
