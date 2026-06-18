import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI if API key available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found. Operating in fallback mode with local cache.");
}

// Pre-seeded high-quality real YouTube videos for fallback and default library
const PRESEEDED_VIDEOS = [
  // Lofi / Study
  {
    id: "jfKfPfyJRdk",
    title: "Lofi Hip Hop Radio 📚 - Beats to relax/study to",
    channelName: "Lofi Girl",
    channelId: "UCocg_S_MO7Geq17g",
    publishedAt: "LIVE NOW",
    duration: "LIVE",
    views: "45K watching",
    thumbnailUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    isLive: true,
    isShort: false,
    description: "Welcome to the lofi hip hop radio stream! Enjoy relaxing beats ideal for work, study, or simple chill out sessions."
  },
  {
    id: "S_MO7Geq17g",
    title: "Lofi hip hop beats - Study & Relax music",
    channelName: "Lofi Girl",
    channelId: "UCocg_S_MO7Geq17g",
    publishedAt: "2 weeks ago",
    duration: "45:12",
    views: "1.2M views",
    thumbnailUrl: "https://img.youtube.com/vi/S_MO7Geq17g/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "Relaxing lofi tracks curated for intensive studying, reading, coding, or sleeping."
  },
  {
    id: "5_7Iuj3DToE",
    title: "Cozy Autumn Rain in the Cozy Cabin 🍂 Rain Sounds for Sleeping & Studying",
    channelName: "Cozy Rain",
    channelId: "UCrP-u75Zz6ySefU3vL3Xk2A",
    publishedAt: "3 months ago",
    duration: "3:00:00",
    views: "240K views",
    thumbnailUrl: "https://img.youtube.com/vi/5_7Iuj3DToE/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "Relax deep with heavy rain sounds falling on roof glass with glowing autumn leaves background."
  },
  {
    id: "k3He_qA1n58",
    title: "Cozy Fireplace 4K 🔥 Fireplace Sounds 10 Hours 1080p",
    channelName: "Fireplace Cinema",
    channelId: "UC3B7S9rCq8sS2tOQ9v21G_w",
    publishedAt: "1 year ago",
    duration: "10:00:00",
    views: "4.8M views",
    thumbnailUrl: "https://img.youtube.com/vi/k3He_qA1n58/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "A gorgeous 4K cozy fireplace sounds for sleep, insomnia, meditation, or warm winter atmosphere."
  },
  // Synthwave / Retro
  {
    id: "4xDzrJKXOOY",
    title: "SYNTHWAVE radio 🌌 - retro cyberpunk beats to cruise/code to",
    channelName: "Lofi Girl Synthwave",
    channelId: "UCocg_S_MO7Geq17g",
    publishedAt: "LIVE NOW",
    duration: "LIVE",
    views: "5.4K watching",
    thumbnailUrl: "https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg",
    isLive: true,
    isShort: false,
    description: "Immersive synthwave radio with outrun synth basslines and neon aesthetics, optimal for programmers and night drivers."
  },
  {
    id: "MVPTGnggLYs",
    title: "Chillsynth Classics - Slow Retro synth soundscapes",
    channelName: "RetroWave Records",
    channelId: "UCq3Cg97Lp0Y7-Gj9gPl_tQw",
    publishedAt: "5 months ago",
    duration: "1:15:30",
    views: "850K views",
    thumbnailUrl: "https://img.youtube.com/vi/MVPTGnggLYs/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "A selection of slow synthwave and chillsynth tracks. Perfect background audio for coding, design, and relaxation."
  },
  // Classical
  {
    id: "W-fFHeTX70Q",
    title: "Chopin - Nocturnes (Full Album with Beautiful Landscapes)",
    channelName: "Classical Symphony",
    channelId: "UC_U2D_M8-A3vGg0vV8PjY9A",
    publishedAt: "2 years ago",
    duration: "1:48:20",
    views: "12M views",
    thumbnailUrl: "https://img.youtube.com/vi/W-fFHeTX70Q/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "Relaxing classical study music. Frédéric Chopin's complete Nocturnes played by world-class solo piano artists."
  },
  {
    id: "mZYCHmR9GZ0",
    title: "Claude Debussy - Clair de Lune Solo Piano",
    channelName: "Royal Piano Studio",
    channelId: "UCa_Vf7I4_e99B1Z0vUOnVzA",
    publishedAt: "4 years ago",
    duration: "5:04",
    views: "22M views",
    thumbnailUrl: "https://img.youtube.com/vi/mZYCHmR9GZ0/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "Debussy's masterpiece Clair de Lune. Enjoy the pure, peaceful solo piano sound on a black screen for relaxation."
  },
  // Nature & Drone
  {
    id: "9ykS_K_TOfs",
    title: "Misty Mountain Pines - 4K Aerial Drone Flight",
    channelName: "Nature Escapes",
    channelId: "UCtZ6A6CWeXmJ_vB_T78_mYw",
    publishedAt: "6 months ago",
    duration: "2:00:00",
    views: "150K views",
    thumbnailUrl: "https://img.youtube.com/vi/9ykS_K_TOfs/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "Relaxing aerial photography of foggy mountain landscapes paired with healing ambient soundscapes."
  },
  {
    id: "2YpI55g0pZ4",
    title: "Deep Sea Ocean Oasis - 10 Hours of Underwater Coral Reefs",
    channelName: "Undersea Cinema",
    channelId: "UC_uVOnZJ_gqby9Qd6tB_I7g",
    publishedAt: "1 year ago",
    duration: "10:00:00",
    views: "1.4M views",
    thumbnailUrl: "https://img.youtube.com/vi/2YpI55g0pZ4/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "Glistening coral reefs, stingrays, sea turtles and colorful schools of fish swimming around tropical waters."
  },
  // Shorts / Live Streams / Test Items
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    channelName: "Rick Astley",
    channelId: "UCuAXFkgcl1yWXWcOD56qy_Q",
    publishedAt: "16 years ago",
    duration: "3:33",
    views: "1.5B views",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    isLive: false,
    isShort: false,
    description: "The official video for Never Gonna Give You Up by Rick Astley. Restored and optimized in high speed."
  }
];

// Simple helper to clean and parse JSON strings from Gemini output
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  // Remove markdown blocks if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

async function fetchYoutubeHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  });
  if (!res.ok) throw new Error(`YouTube request failed with status: ${res.status}`);
  return await res.text();
}

function parseYtInitialData(html: string): any {
  try {
    const match = html.match(/(?:window\["ytInitialData"\]|var ytInitialData)\s*=\s*({.*?});/);
    if (match) return JSON.parse(match[1]);
    const match2 = html.match(/ytInitialData\s*=\s*({.*?});/);
    if (match2) return JSON.parse(match2[1]);
  } catch (err) {
    console.error("Failed to parse ytInitialData JSON:", err);
  }
  return null;
}

function parseVideoRenderer(renderer: any) {
  try {
    const id = renderer.videoId;
    if (!id) return null;
    const title = renderer.title?.runs?.[0]?.text || renderer.title?.simpleText || "Untitled Video";
    const channelName = renderer.ownerText?.runs?.[0]?.text || renderer.shortBylineText?.runs?.[0]?.text || "YouTube Creator";
    const channelId = renderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || renderer.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "UC_default";
    const publishedAt = renderer.publishedTimeText?.simpleText || "Recently";
    const duration = renderer.lengthText?.simpleText || "4:00";
    const views = renderer.viewCountText?.simpleText || renderer.viewCountText?.runs?.[0]?.text || "10K views";
    const description = renderer.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || renderer.descriptionSnippet?.runs?.[0]?.text || "";
    
    return {
      id,
      title,
      channelName,
      channelId,
      publishedAt,
      duration,
      views,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      isLive: duration === "LIVE" || renderer.badges?.some((b: any) => b.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW"),
      isShort: false,
      description
    };
  } catch (e) {
    return null;
  }
}

function parsePlaylistRenderer(renderer: any) {
  try {
    const id = renderer.playlistId;
    if (!id) return null;
    const title = renderer.title?.runs?.[0]?.text || renderer.title?.simpleText || "Untitled Playlist";
    const channelName = renderer.ownerText?.runs?.[0]?.text || renderer.shortBylineText?.runs?.[0]?.text || "Curator Archive";
    const itemCount = renderer.videoCount || renderer.videoCountShortText?.simpleText || "10";
    
    return {
      id,
      title,
      channelName,
      channelId: "UC_playlist",
      publishedAt: "Curated Setlist",
      duration: "Playlist",
      views: `${itemCount} tracks`,
      thumbnailUrl: renderer.thumbnails?.[0]?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${renderer.navigationEndpoint?.watchEndpoint?.videoId}/hqdefault.jpg`,
      isLive: false,
      isShort: false,
      description: "Atmospheric playlist curation archive."
    };
  } catch (e) {
    return null;
  }
}

function parseChannelRenderer(renderer: any) {
  try {
    const id = renderer.channelId;
    if (!id) return null;
    const title = renderer.title?.simpleText || renderer.title?.runs?.[0]?.text || "Unknown Creator";
    const subscriberCount = renderer.subscriberCountText?.simpleText || "100K subscribers";
    const description = renderer.descriptionSnippet?.runs?.[0]?.text || "No channel descriptions retrieved.";
    
    let thumb = renderer.thumbnail?.thumbnails?.[0]?.url || "";
    if (thumb && !thumb.startsWith("http")) {
      thumb = "https:" + thumb;
    }
    
    return {
      id,
      title,
      channelName: title,
      channelId: id,
      publishedAt: "Channel Creator",
      duration: "Channel",
      views: subscriberCount,
      thumbnailUrl: thumb || `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`,
      isLive: false,
      isShort: false,
      description
    };
  } catch (e) {
    return null;
  }
}

function scanRenderers(obj: any, results: { videos: any[]; playlists: any[]; channels: any[] } = { videos: [], playlists: [], channels: [] }) {
  if (!obj || typeof obj !== "object") return results;
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      scanRenderers(item, results);
    }
  } else {
    if (obj.videoRenderer) {
      const v = parseVideoRenderer(obj.videoRenderer);
      if (v) results.videos.push(v);
    }
    if (obj.playlistRenderer) {
      const p = parsePlaylistRenderer(obj.playlistRenderer);
      if (p) results.playlists.push(p);
    }
    if (obj.channelRenderer) {
      const c = parseChannelRenderer(obj.channelRenderer);
      if (c) results.channels.push(c);
    }
    
    for (const key of Object.keys(obj)) {
      scanRenderers(obj[key], results);
    }
  }
  return results;
}

// 0. SUGGESTIONS ENDPOINT (Query autocomplete completions directly from YouTube complete service)
app.get("/api/suggestions", async (req, res) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.json([]);
  }
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data[1])) {
        // Return up to 10 autocomplete suggestions from YouTube
        return res.json(data[1].slice(0, 10));
      }
    }
  } catch (err) {
    console.error("YouTube search suggestions scraper failed:", err);
  }

  // Local fallback if outward fetch fails or goes offline
  const fallbackSuggestions = [
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
  const matched = fallbackSuggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );
  return res.json(matched.slice(0, 10));
});

// 1. SEARCH ENDPOINT
app.get("/api/search", async (req, res) => {
  const rawQuery = (req.query.q as string || "").trim();
  const searchType = (req.query.type as string || "video").toLowerCase();
  
  // Default to popular "trending music" if search query is empty to fulfill
  // auto-load home page content on first website load
  const query = rawQuery || "trending music";

  const localMatch = PRESEEDED_VIDEOS.filter(v => 
    v.title.toLowerCase().includes(query.toLowerCase()) || 
    v.channelName.toLowerCase().includes(query.toLowerCase())
  );

  try {
    console.log(`Starting Scraper Search on YouTube for "${query}" (Type: ${searchType})`);
    
    let sp = "";
    if (searchType === "channel") sp = "EgIQAg%3D%3D";
    else if (searchType === "playlist") sp = "EgIQAw%3D%3D";
    else if (searchType === "live") sp = "EgJAAQ%3D%3D";
    else if (searchType === "short") sp = "EgIQAQ%3D%3D";

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${sp ? `&sp=${sp}` : ""}`;
    const html = await fetchYoutubeHtml(searchUrl);
    const ytData = parseYtInitialData(html);
    
    if (ytData) {
      const scanned = scanRenderers(ytData);
      
      let results: any[] = [];
      if (searchType === "channel") {
        results = scanned.channels.map(c => ({
          id: c.id,
          title: c.title,
          channelName: c.title,
          channelId: c.id,
          publishedAt: "Channel Creator",
          duration: "Channel",
          views: c.views,
          thumbnailUrl: c.thumbnailUrl,
          isLive: false,
          isShort: false,
          description: c.description || `YouTube channel portfolio of ${c.title}.`
        }));
      } else if (searchType === "playlist") {
        results = scanned.playlists.map(p => ({
          id: p.id,
          title: p.title,
          channelName: p.channelName,
          channelId: "UC_playlist",
          publishedAt: "Playlist Portfolio",
          duration: "Playlist",
          views: p.views,
          thumbnailUrl: p.thumbnailUrl,
          isLive: false,
          isShort: false,
          description: `Curated setlist compilation.`
        }));
      } else {
        let videos = scanned.videos;
        if (searchType === "short") {
          videos = videos.filter(v => {
            const parts = v.duration.split(":");
            if (parts.length === 2 && parseInt(parts[0]) === 0) return true;
            if (v.title.toLowerCase().includes("short") || v.description?.toLowerCase().includes("short")) return true;
            return false;
          });
          if (videos.length === 0) {
            videos = scanned.videos.slice(0, 8);
          }
        }
        
        results = videos.map(v => ({
          id: v.id,
          title: v.title,
          channelName: v.channelName,
          channelId: v.channelId,
          publishedAt: v.publishedAt,
          duration: v.duration,
          views: v.views,
          thumbnailUrl: v.thumbnailUrl,
          isLive: v.isLive,
          isShort: searchType === "short" ? true : v.isShort,
          description: v.description || "Stream directly from dynamic YouTube node."
        }));
      }

      if (results.length > 0) {
        console.log(`YouTube HTML page-scraper succeeded! Fetched ${results.length} authentic records.`);
        return res.json(results.slice(0, 15));
      }
    }
    
    throw new Error("No renderers matched or parsed from raw HTML");
  } catch (err) {
    console.error("YouTube Live Scraper failed, running Gemini/local fallback:", err);
    if (ai) {
      try {
        console.log(`Querying Gemini with Search Grounding as robust fallback for: "${query}" (Type: ${searchType})`);
        const prompt = `You are a helper backend for YTWeb.
Locate REAL, existing and playable YouTube content matching the query: "${query}".
The requested category/type is: "${searchType}" (options: "video", "channel", "playlist", "short", "live").
Return a JSON array of up to 10 high-quality results.
Each object must have:
- "id": YouTube ID (11 chars for video/short, "PL..." for playlists, "UC..." for channels).
- "title": Title of video, channel, or playlist.
- "channelName": Channel name holding this resource.
- "channelId": Channel identifier (UC...).
- "publishedAt": "3 months ago" etc.
- "duration": "MM:SS" or "LIVE".
- "views": e.g., "150K views".
- "thumbnailUrl": standard img.youtube.com URL.
- "isLive": boolean.
- "isShort": boolean.
- "description": Bio info or video summary.

Return ONLY raw JSON, no markdown formatting.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.2,
          }
        });

        const parsed = cleanAndParseJSON(response.text || "");
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((item: any) => ({
            id: String(item.id || "").trim(),
            title: String(item.title || "Untitled Video"),
            channelName: String(item.channelName || "YouTube Creator"),
            channelId: String(item.channelId || "UC_default"),
            publishedAt: String(item.publishedAt || "Recently"),
            duration: String(item.duration || "4:00"),
            views: String(item.views || "10K views"),
            thumbnailUrl: `https://img.youtube.com/vi/${String(item.id || "").trim()}/hqdefault.jpg`,
            isLive: !!item.isLive,
            isShort: !!item.isShort,
            description: String(item.description || "No description available.")
          }));
          return res.json(formatted);
        }
      } catch (gemError) {
        console.error("Gemini grounding fallback search failed:", gemError);
      }
    }
    return res.json(localMatch.length > 0 ? localMatch : PRESEEDED_VIDEOS);
  }
});

// 2. CHANNEL ENDPOINT
app.get("/api/channel/:id", async (req, res) => {
  const channelId = req.params.id;
  const channelNameQuery = (req.query.name as string || "Unknown Channel").trim();

  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${channelId}`;
  const bannerUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=60&w=1200&h=300`;

  const defaultMeta = {
    id: channelId,
    name: channelNameQuery,
    avatarUrl,
    bannerUrl,
    subscriberCount: "1.24M subscribers",
    description: "Welcome to our streaming archive! Optimized for smooth playback on older devices and WebViews.",
    uploads: PRESEEDED_VIDEOS.map(v => ({ ...v, channelId, channelName: channelNameQuery })),
    shorts: PRESEEDED_VIDEOS.filter(v => !v.isLive).slice(0, 4).map(v => ({ ...v, isShort: true, channelId, channelName: channelNameQuery })),
    liveStreams: PRESEEDED_VIDEOS.filter(v => v.isLive).map(v => ({ ...v, channelId, channelName: channelNameQuery })),
    playlists: [
      { id: "PL_lofi_retro", title: "Lofi Retro Grooves", itemCount: 12, channelName: channelNameQuery, thumbnailUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg" },
      { id: "PL_ambient_space", title: "Deep Nature Flight", itemCount: 8, channelName: channelNameQuery, thumbnailUrl: "https://img.youtube.com/vi/9ykS_K_TOfs/hqdefault.jpg" }
    ]
  };

  try {
    console.log(`Starting YouTube Channel HTML content scraper for Channel: ${channelId}`);
    const videosUrl = `https://www.youtube.com/channel/${channelId}/videos`;
    const html = await fetchYoutubeHtml(videosUrl);
    const ytData = parseYtInitialData(html);
    
    let realUploads: any[] = [];
    let realPlaylists: any[] = [];
    let subscriberCount = "1.52M subscribers";
    let channelDescription = "Welcome to our streaming archive! Optimized for smooth playback on older devices and WebViews.";
    let scrapedAvatar = avatarUrl;

    if (ytData) {
      const scanned = scanRenderers(ytData);
      realUploads = scanned.videos.map(v => ({
        id: v.id,
        title: v.title,
        channelName: channelNameQuery,
        channelId: channelId,
        publishedAt: v.publishedAt,
        duration: v.duration,
        views: v.views,
        thumbnailUrl: v.thumbnailUrl,
        isLive: v.isLive,
        isShort: false,
        description: v.description || "Upload archive stream."
      }));

      realPlaylists = scanned.playlists.map(p => ({
        id: p.id,
        title: p.title,
        itemCount: parseInt(p.views) || 8,
        channelName: channelNameQuery,
        thumbnailUrl: p.thumbnailUrl
      }));

      if (scanned.channels && scanned.channels[0]) {
        scrapedAvatar = scanned.channels[0].thumbnailUrl || scrapedAvatar;
        subscriberCount = scanned.channels[0].views || subscriberCount;
        channelDescription = scanned.channels[0].description || channelDescription;
      }
    }

    // Dynamic search fallback: if channel page is empty or blocked, query YouTube search for creator's related items!
    if (realUploads.length === 0) {
      console.log(`Channel direct page empty, scraping dynamic search results for related items of: "${channelNameQuery}"`);
      const searchHtml = await fetchYoutubeHtml(`https://www.youtube.com/results?search_query=${encodeURIComponent(channelNameQuery)}`);
      const searchData = parseYtInitialData(searchHtml);
      if (searchData) {
        const searchScanned = scanRenderers(searchData);
        if (searchScanned.videos && searchScanned.videos.length > 0) {
          realUploads = searchScanned.videos.map(v => ({
            id: v.id,
            title: v.title,
            channelName: v.channelName || channelNameQuery,
            channelId: v.channelId || channelId,
            publishedAt: v.publishedAt || "Recently",
            duration: v.duration || "5:00",
            views: v.views || "100K views",
            thumbnailUrl: v.thumbnailUrl,
            isLive: v.isLive,
            isShort: false,
            description: v.description || "Related popular upload."
          }));
        }
      }
    }

    if (realUploads.length > 0) {
      console.log(`Successfully scraped uploads/related items for channel ${channelNameQuery}`);
      return res.json({
        id: channelId,
        name: channelNameQuery,
        avatarUrl: scrapedAvatar,
        bannerUrl,
        subscriberCount,
        description: channelDescription,
        uploads: realUploads,
        shorts: [], // Cleanly omit shorts as requested
        liveStreams: realUploads.filter(u => u.isLive || u.duration === "LIVE"),
        playlists: realPlaylists.length > 0 ? realPlaylists : defaultMeta.playlists
      });
    }
    
    throw new Error("No uploads resolved from scraped page");
  } catch (err) {
    console.error("Channel HTML scraper failed, running fallback:", err);
    if (ai) {
      try {
        console.log(`Querying Gemini with Search Grounding fallback for channel: ${channelId}`);
        const prompt = `You are an intelligent YouTube metadata parser. 
Retrieve authentic uploads for channel ID: "${channelId}" (Named: "${channelNameQuery}").
Format your output exactly as solid JSON with the keys below:
{
  "id": "${channelId}",
  "name": "${channelNameQuery}",
  "subscriberCount": "1.2M subscribers",
  "description": "Channel bio here.",
  "uploads": [{ "id": "11-char ID", "title": "...", "duration": "...", "views": "...", "publishedAt": "..." }],
  "shorts": [{ "id": "11-char ID", "title": "...", "duration": "...", "views": "...", "publishedAt": "..." }],
  "liveStreams": [],
  "playlists": []
}

Return *ONLY* the valid raw JSON object. Do not enclose in markdown blocks.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.2
          }
        });

        const parsed = cleanAndParseJSON(response.text || "");
        if (parsed && parsed.name) {
          const mapVideo = (v: any) => ({
            id: String(v.id || "").trim(),
            title: String(v.title || "Untitled"),
            channelName: parsed.name,
            channelId: channelId,
            publishedAt: String(v.publishedAt || "Recently"),
            duration: String(v.duration || "5:00"),
            views: String(v.views || "50K views"),
            thumbnailUrl: `https://img.youtube.com/vi/${String(v.id || "").trim()}/hqdefault.jpg`,
            isLive: !!v.isLive || v.duration === "LIVE",
            isShort: !!v.isShort
          });

          return res.json({
            id: channelId,
            name: parsed.name,
            avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${parsed.name}`,
            bannerUrl,
            subscriberCount: parsed.subscriberCount || "1.0M subscribers",
            description: parsed.description || defaultMeta.description,
            uploads: Array.isArray(parsed.uploads) ? parsed.uploads.map(mapVideo) : defaultMeta.uploads,
            shorts: Array.isArray(parsed.shorts) ? parsed.shorts.map(v => ({ ...mapVideo(v), isShort: true })) : defaultMeta.shorts,
            liveStreams: Array.isArray(parsed.liveStreams) ? parsed.liveStreams.map(mapVideo) : [],
            playlists: defaultMeta.playlists
          });
        }
      } catch (gemErr) {
        console.error("Gemini channel fallback failed:", gemErr);
      }
    }
    return res.json(defaultMeta);
  }
});

// 3. PLAYLIST VIDEOS ENDPOINT
app.get("/api/playlist/:id", async (req, res) => {
  const playlistId = req.params.id;
  const playlistTitle = (req.query.title as string || "Curated Hits").trim();

  const defaultMeta = {
    id: playlistId,
    title: playlistTitle,
    channelName: "Curator",
    itemCount: PRESEEDED_VIDEOS.length,
    thumbnailUrl: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
    videos: PRESEEDED_VIDEOS.map((v, idx) => ({ ...v, title: `Track ${idx + 1}: ${v.title}` }))
  };

  try {
    console.log(`Starting YouTube Playlist HTML scraper for Playlist: ${playlistId}`);
    const plUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const html = await fetchYoutubeHtml(plUrl);
    const ytData = parseYtInitialData(html);
    
    if (ytData) {
      const scanned = scanRenderers(ytData);
      
      const realVideos = scanned.videos.map(v => ({
        id: v.id,
        title: v.title,
        channelName: v.channelName,
        channelId: v.channelId,
        publishedAt: "Playlist Track",
        duration: v.duration,
        views: v.views,
        thumbnailUrl: v.thumbnailUrl,
        isLive: v.isLive,
        isShort: false,
        description: v.description || "Curated playlist tracks."
      }));

      if (realVideos.length > 0) {
        console.log(`Playlist Scraper successfully parsed playlist ${playlistId} with ${realVideos.length} videos.`);
        return res.json({
          id: playlistId,
          title: playlistTitle,
          channelName: scanned.channels[0]?.title || "Curated Archive",
          itemCount: realVideos.length,
          thumbnailUrl: realVideos[0]?.thumbnailUrl || defaultMeta.thumbnailUrl,
          videos: realVideos
        });
      }
    }
    
    throw new Error("No video tracks scraped");
  } catch (err) {
    console.error("Playlist scraper failed, running fallback:", err);
    if (ai) {
      try {
        console.log(`Querying Gemini with Search Grounding fallback for playlist: ${playlistId}`);
        const prompt = `You are a YouTube playlists crawling agent.
Retrieve the tracks belonging to YouTube playlist ID: "${playlistId}" (Title: "${playlistTitle}").
Return *ONLY* the valid raw JSON object matching the schema below:
{
  "id": "${playlistId}",
  "title": "${playlistTitle}",
  "channelName": "Curator",
  "itemCount": 8,
  "thumbnailUrl": "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg",
  "videos": [
    { "id": "11-char ID", "title": "...", "channelName": "...", "channelId": "...", "duration": "...", "views": "..." }
  ]
}

No markdown wrappers or formatting outside the JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.2
          }
        });

        const parsed = cleanAndParseJSON(response.text || "");
        if (parsed && Array.isArray(parsed.videos)) {
          const formattedVideos = parsed.videos.map((v: any) => ({
            id: String(v.id || "").trim(),
            title: String(v.title || "Untitled Playlist Video"),
            channelName: String(v.channelName || "YouTube Creator"),
            channelId: String(v.channelId || "UC_default"),
            publishedAt: "Playlist Item",
            duration: String(v.duration || "4:00"),
            views: String(v.views || "100K views"),
            thumbnailUrl: `https://img.youtube.com/vi/${String(v.id || "").trim()}/hqdefault.jpg`,
            isLive: v.duration === "LIVE",
            isShort: false
          }));

          return res.json({
            id: playlistId,
            title: parsed.title || playlistTitle,
            channelName: parsed.channelName || "Curated playlist",
            itemCount: formattedVideos.length,
            thumbnailUrl: `https://img.youtube.com/vi/${formattedVideos[0]?.id}/hqdefault.jpg`,
            videos: formattedVideos
          });
        }
      } catch (gemErr) {
        console.error("Gemini playlist fallback failed:", gemErr);
      }
    }
    return res.json(defaultMeta);
  }
});

// Diagnostics API for testing
app.get("/api/diagnostics", (req, res) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Serve static assets in production
const distPath = path.join(process.cwd(), "dist");

async function initServer() {
  const isDev = process.env.NODE_ENV !== "production" || process.env.VITE_DEV === "true";
  if (isDev) {
    console.log("Setting up Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`Serving static files from production dist path: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`YTWeb Server running on port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
