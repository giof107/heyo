import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import BadgeIcon from './BadgeIcon';

interface ChatMessageProps {
  message: ChatMessageType;
  bannedWords: string[];
  highlightColor: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, bannedWords, highlightColor }) => {
  const renderContent = (content: string) => {
    let parts = content.split(/(\[emote:\d+:[^\]]+\])/);
    
    return parts.map((part, index) => {
      const emoteMatch = part.match(/\[emote:(\d+):([^\]]+)\]/);
      if (emoteMatch) {
        const [, emoteId] = emoteMatch;
        return (
          <img
            key={index}
            src={`https://files.kick.com/emotes/${emoteId}/fullsize`}
            alt={emoteMatch[2]}
            className="inline-block h-6"
          />
        );
      }

      // Highlight banned words
      let text = part;
      bannedWords.forEach(word => {
        if (word) {
          const regex = new RegExp(`(${word})`, 'gi');
          text = text.replace(regex, match => 
            `<span style="background-color: ${highlightColor}; font-weight: bold;">${match}</span>`
          );
        }
      });

      return <span key={index} dangerouslySetInnerHTML={{ __html: text }} />;
    });
  };

  return (
    <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
      {message.original_message && (
        <div className="ml-4 pl-2 border-l-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm mb-1">
          {renderContent(message.original_message.content)}
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex items-center flex-wrap gap-1">
          {message.sender.identity.badges.map((badge, index) => (
            <BadgeIcon key={index} badge={badge} />
          ))}
          <span style={{ color: message.sender.identity.color }} className="font-semibold">
            {message.sender.username}:
          </span>
        </div>
        <div className="mt-1 break-words">{renderContent(message.content)}</div>
      </div>
    </div>
  );
};

export default ChatMessage