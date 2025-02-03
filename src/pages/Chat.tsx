import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import { Moon, Sun, ArrowLeft, ArrowDown } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import Settings from '../components/Settings';
import { ChatMessage as ChatMessageType, ChatTab, SubscriberBadge, Badge } from '../types/chat';
import { getInitialTheme, setTheme } from '../utils/theme';

const MAX_MESSAGES = 200;
const MAX_CACHED_MESSAGES = 1000;

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [modMessages, setModMessages] = useState<ChatMessageType[]>([]);
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessageType[]>([]);
  const [trackedUsers, setTrackedUsers] = useState<string[]>([]);
  const [trackedMessages, setTrackedMessages] = useState<ChatMessageType[]>([]);
  const [activeTab, setActiveTab] = useState<ChatTab>('all');
  const [isDark, setIsDark] = useState(getInitialTheme());
  const [isModMode, setIsModMode] = useState(false);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const { channelId, chatroomId, username, subscriberBadges } = location.state || {};

  // Get the appropriate subscriber badge based on months
  const getSubscriberBadge = (months: number) => {
    if (!subscriberBadges) return null;
    
    // Sort badges by months in descending order
    const sortedBadges = [...subscriberBadges].sort((a, b) => b.months - a.months);
    
    // Find the first badge that matches or is less than the user's months
    return sortedBadges.find(badge => months >= badge.months);
  };

  // Process badges for a message
  const processBadges = (badges: Badge[]) => {
    return badges.map(badge => {
      if (badge.type === 'subscriber' && badge.count) {
        const subBadge = getSubscriberBadge(badge.count);
        if (subBadge) {
          return {
            ...badge,
            image: subBadge.badge_image.src
          };
        }
      }
      return badge;
    });
  };

  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if (!channelId || !chatroomId) {
      navigate('/');
      return;
    }

    if (!pusherRef.current) {
      pusherRef.current = new Pusher('32cbd69e4b950bf97679', {
        wsHost: 'ws-us2.pusher.com',
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        cluster: 'us2',
        version: '8.4.0-rc2'
      });
    }

    const pusher = pusherRef.current;
    const subscriptions = [
      `chatroom_${chatroomId}`,
      `chatrooms.${chatroomId}.v2`,
      `channel_${channelId}`,
      `channel.${channelId}`,
      `chatrooms.${chatroomId}`,
    ];

    subscriptions.forEach(channel => {
      const channelObj = pusher.subscribe(channel);
      channelObj.bind('pusher:subscription_succeeded', () => {
        console.log(`Successfully subscribed to ${channel}`);
      });
    });

    const messageHandler = (message: ChatMessageType) => {
      try {
        // Process badges for the message
        message.sender.identity.badges = processBadges(message.sender.identity.badges);

        const isModOrStreamer = message.sender.identity.badges.some(
          badge => badge.type === 'moderator' || badge.type === 'streamer'
        );

        const isTrackedUser = trackedUsers.includes(message.sender.username.toLowerCase());
        const containsBannedWord = bannedWords.some(word => 
          message.content.toLowerCase().includes(word.toLowerCase())
        );

        if (containsBannedWord) {
          setFlaggedMessages(prev => [...prev.slice(-MAX_CACHED_MESSAGES), message]);
        }
        
        if (isTrackedUser) {
          setTrackedMessages(prev => [...prev.slice(-MAX_CACHED_MESSAGES), message]);
        }

        if (!isPaused) {
          setMessages(prev => [...prev.slice(-MAX_MESSAGES + 1), message]);
          if (isModOrStreamer) {
            setModMessages(prev => [...prev.slice(-MAX_MESSAGES + 1), message]);
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    pusher.bind('App\\Events\\ChatMessageEvent', messageHandler);

    return () => {
      pusher.unbind('App\\Events\\ChatMessageEvent', messageHandler);
      if (pusherRef.current && !document.hidden) {
        subscriptions.forEach(channel => {
          pusherRef.current?.unsubscribe(channel);
        });
      }
    };
  }, [channelId, chatroomId, navigate, bannedWords, isPaused, trackedUsers, subscriberBadges]);

  useEffect(() => {
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
      
      if (!isAutoScrolling) {
        setIsPaused(!isAtBottom);
      }
      setIsAutoScrolling(false);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      setIsAutoScrolling(true);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, isPaused]);

  const getDisplayMessages = () => {
    switch (activeTab) {
      case 'modstreamer':
        return modMessages;
      case 'flagged':
        return isModMode ? flaggedMessages : [];
      case 'tracked':
        return trackedMessages;
      default:
        return messages;
    }
  };

  const handleTimeoutUser = async (username: string, duration: number) => {
    // This would be implemented with the actual API
    console.log(`Timeout user ${username} for ${duration} seconds`);
  };

  const scrollToBottom = () => {
    setIsPaused(false);
    setIsAutoScrolling(true);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between border-b dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <h1 className="text-xl font-semibold dark:text-white">{username}'s Chat</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <Settings
            isModMode={isModMode}
            onModModeChange={setIsModMode}
            bannedWords={bannedWords}
            onBannedWordsChange={setBannedWords}
            isDark={isDark}
            trackedUsers={trackedUsers}
            onTrackedUsersChange={(users) => setTrackedUsers(users.map(u => u.toLowerCase()))}
            onTimeoutUser={handleTimeoutUser}
          />
        </div>
      </div>

      <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex">
          <button
            className={`px-4 py-2 ${
              activeTab === 'all'
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Messages
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'modstreamer'
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('modstreamer')}
          >
            Mod/Streamer
          </button>
          {trackedUsers.length > 0 && (
            <button
              className={`px-4 py-2 ${
                activeTab === 'tracked'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('tracked')}
            >
              Tracked Users
            </button>
          )}
          {isModMode && (
            <button
              className={`px-4 py-2 ${
                activeTab === 'flagged'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('flagged')}
            >
              Flagged Messages
            </button>
          )}
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 relative"
      >
        <div className="py-4">
          {getDisplayMessages().map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              bannedWords={bannedWords}
              highlightColor={isDark ? '#4B5563' : '#E5E7EB'}
              isHighlighted={trackedUsers.includes(message.sender.username.toLowerCase())}
              trackedUsers={trackedUsers}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {isPaused && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={scrollToBottom}
              className="bg-black/75 dark:bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg hover:bg-black/85 dark:hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <span>Chat paused while scrolling</span>
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;