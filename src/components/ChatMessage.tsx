import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/chat';
import BadgeIcon from './BadgeIcon';

const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
  return (
    <div className="p-2 hover:bg-gray-50">
      {message.original_message && (
        <div className="ml-4 pl-2 border-l-2 border-gray-300 text-gray-500 text-sm mb-1">
          {message.original_message.content}
        </div>
      )}
      <div className="flex items-start">
        <div className="flex flex-wrap items-center">
          {message.sender.identity.badges.map((badge, index) => (
            <BadgeIcon key={index} badge={badge} />
          ))}
          <span style={{ color: message.sender.identity.color }} className="font-semibold">
            {message.sender.username}:
          </span>
        </div>
        <div className="ml-2">{message.content}</div>
      </div>
    </div>
  );
};

export default ChatMessage;