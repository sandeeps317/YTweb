export interface Video {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  views: string;
  description?: string;
  thumbnailUrl: string;
  isLive?: boolean;
  isShort?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: string;
  description?: string;
  uploads?: Video[];
  shorts?: Video[];
  playlists?: Playlist[];
  liveStreams?: Video[];
}

export interface Playlist {
  id: string;
  title: string;
  itemCount: number;
  channelName: string;
  thumbnailUrl: string;
  videos?: Video[];
}

export interface PlaybackState {
  currentVideo: Video | null;
  playlist: Video[];
  currentIndex: number;
  isShuffle: boolean;
  isPlaying: boolean;
}

export interface DiagnosticResult {
  testName: string;
  passed: boolean;
  message: string;
}
