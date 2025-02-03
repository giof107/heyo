import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import { Moon, Sun, ArrowLeft, ArrowDown } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import Settings from '../components/Settings';
import { ChatMessage as ChatMessageType, ChatTab } from '../types/chat';
import { getInitialTheme, setTheme } from '../utils/theme';

const MAX_MESSAGES = 200;

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [modMessages, setModMessages] = useState<ChatMessageType[]>([]);
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessageType[]>([]);
  const [activeTab, setActiveTab] = useState<ChatTab>('all');
  const [isDark, setIsDark] = useState(getInitialTheme());
  const [isModMode, setIsModMode] = useState(false);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const { channelId, chatroomId, username } = location.state || {};

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
        const isModOrStreamer = message.sender.identity.badges.some(
          badge => badge.type === 'moderator' || badge.type === 'streamer'
        );

        const containsBannedWord = bannedWords.some(word => 
          message.content.toLowerCase().includes(word.toLowerCase())
        );

        if (containsBannedWord) {
          setFlaggedMessages(prev => [...prev, message]);
        } else {
          if (!isPaused) {
            setMessages(prev => [...prev.slice(-MAX_MESSAGES + 1), message]);
            if (isModOrStreamer) {
              setModMessages(prev => [...prev.slice(-MAX_MESSAGES + 1), message]);
            }
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
  }, [channelId, chatroomId, navigate, bannedWords, isPaused]);

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
      default:
        return messages;
    }
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
        <div className="p-4">
          {getDisplayMessages().map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              bannedWords={bannedWords}
              highlightColor={isDark ? '#4B5563' : '#E5E7EB'}
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
              <span>Kaydırırken sohbet duraklatıldı</span>
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;