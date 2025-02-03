export interface ChatMessage {
  id: string;
  chatroom_id: number;
  content: string;
  type: string;
  created_at: string;
  sender: {
    id: number;
    username: string;
    slug: string;
    identity: {
      color: string;
      badges: Badge[];
    };
  };
  original_message?: {
    content: string;
  };
}

export interface Badge {
  type: 'streamer' | 'founder' | 'moderator' | 'subscriber' | 'og' | 'vip';
  text: string;
  count?: number;
}

export interface ChannelInfo {
  id: number;
  chatroom: {
    id: number;
  };
}

export type ChatTab = 'all' | 'modstreamer' | 'flagged';

export interface ThemeState {
  isDark: boolean;
}