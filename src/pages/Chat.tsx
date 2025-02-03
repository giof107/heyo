import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js';
import { ArrowLeft } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import Settings from '../components/Settings';
import { ChatMessage as ChatMessageType } from '../types/chat';

const Chat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [filters, setFilters] = useState({
    showModOnly: false,
    showStreamerOnly: false,
  });
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [flaggedMessages, setFlaggedMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const { channelId, chatroomId, username } = location.state || {};

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

    const messageHandler = (message: any) => {
      try {
        const containsBannedWord = bannedWords.some(word => 
          message.content.toLowerCase().includes(word.toLowerCase())
        );

        if (containsBannedWord) {
          setFlaggedMessages(prev => [...prev, message]);
        } else {
          setMessages(prev => [...prev, message]);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    pusher.bind('App\\Events\\ChatMessageEvent', messageHandler);

    pusher.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });

    return () => {
      pusher.unbind('App\\Events\\ChatMessageEvent', messageHandler);
      if (pusherRef.current && !document.hidden) {
        subscriptions.forEach(channel => {
          pusherRef.current?.unsubscribe(channel);
        });
      }
    };
  }, [channelId, chatroomId, navigate, bannedWords]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredMessages = messages.filter(message => {
    if (filters.showModOnly) {
      return message.sender.identity.badges.some(badge => badge.type === 'moderator');
    }
    if (filters.showStreamerOnly) {
      return message.sender.identity.badges.some(badge => badge.type === 'streamer');
    }
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{username}'s Chat</h1>
        </div>
        <Settings
          filters={filters}
          onFilterChange={setFilters}
          bannedWords={bannedWords}
          onBannedWordsChange={setBannedWords}
        />
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-4">
          {filteredMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {flaggedMessages.length > 0 && (
          <div className="w-64 bg-red-50 border-l border-red-200 overflow-y-auto">
            <div className="p-4 bg-red-100 border-b border-red-200">
              <h3 className="font-semibold text-red-700">Flagged Messages</h3>
            </div>
            <div className="p-2">
              {flaggedMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;