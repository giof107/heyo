import { ChannelInfo } from './channel';

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
  image?: string;
}

export interface SubscriberBadge {
  id: number;
  channel_id: number;
  months: number;
  badge_image: {
    srcset: string;
    src: string;
  };
}

export type ChatTab = 'all' | 'modstreamer' | 'flagged' | 'tracked';