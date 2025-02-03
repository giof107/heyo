import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import BadgeIcon from './BadgeIcon';
import UserProfile from './UserProfile';

interface ChatMessageProps {
  message: ChatMessageType;
  bannedWords: string[];
  highlightColor: string;
  isHighlighted?: boolean;
  onTrackUser?: (username: string) => void;
  trackedUsers: string[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  bannedWords, 
  highlightColor,
  isHighlighted,
  onTrackUser,
  trackedUsers
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [profilePosition, setProfilePosition] = useState({ x: 0, y: 0 });

  const handleUsernameClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setProfilePosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    setShowProfile(true);
  };

  const renderContent = (content: string) => {
    // Split content by spaces to process mentions
    const words = content.split(/(\s+)/);
    
    return words.map((word, index) => {
      // Check if word is a mention
      if (word.startsWith('@')) {
        const username = word.slice(1);
        return (
          <span
            key={index}
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={handleUsernameClick}
          >
            {word}
          </span>
        );
      }

      // Check if word is an emote
      const emoteMatch = word.match(/\[emote:(\d+):([^\]]+)\]/);
      if (emoteMatch) {
        const [, emoteId] = emoteMatch;
        return (
          <img
            key={index}
            src={`https://files.kick.com/emotes/${emoteId}/fullsize`}
            alt={emoteMatch[2]}
            className="inline-block h-6 -mt-1 mx-0.5"
          />
        );
      }

      // Process banned words
      let processedWord = word;
      bannedWords.forEach(bannedWord => {
        if (bannedWord) {
          const regex = new RegExp(`(${bannedWord})`, 'gi');
          processedWord = processedWord.replace(regex, match => 
            `<span style="background-color: ${highlightColor}; font-weight: bold;">${match}</span>`
          );
        }
      });

      return <span key={index} dangerouslySetInnerHTML={{ __html: processedWord }} />;
    });
  };

  return (
    <>
      <div className={`px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
        isHighlighted ? 'bg-purple-50 dark:bg-purple-900/20' : ''
      }`}>
        {message.original_message && (
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            {renderContent(message.original_message.content)}
          </div>
        )}
        <div className="break-words">
          <span className="inline-flex items-center gap-1 mr-1">
            {message.sender.identity.badges.map((badge, index) => (
              <BadgeIcon key={index} badge={badge} />
            ))}
          </span>
          <span 
            style={{ color: message.sender.identity.color }} 
            className="font-semibold cursor-pointer hover:underline"
            onClick={handleUsernameClick}
          >
            {message.sender.username}
          </span>
          <span className="text-gray-300 dark:text-gray-600 mx-1">:</span>
          <span className="whitespace-pre-wrap">{renderContent(message.content)}</span>
        </div>
      </div>

      {showProfile && (
        <UserProfile
          username={message.sender.username}
          position={profilePosition}
          onClose={() => setShowProfile(false)}
          onTrackUser={onTrackUser}
          isTracked={trackedUsers.includes(message.sender.username.toLowerCase())}
          recentMessages={[
            { content: "Last message 1", timestamp: "2024-03-14 12:00" },
            { content: "Last message 2", timestamp: "2024-03-14 11:55" },
            { content: "Last message 3", timestamp: "2024-03-14 11:50" }
          ]}
        />
      )}
    </>
  );
};

export default ChatMessage;