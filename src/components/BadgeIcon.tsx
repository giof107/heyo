import React from 'react';
import { Badge } from '../types/chat';

const BadgeIcon: React.FC<{ badge: Badge }> = ({ badge }) => {
  const getIcon = () => {
    switch (badge.type) {
      case 'streamer':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
          </svg>
        );
      case 'founder':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      // Add other badge icons...
      default:
        return null;
    }
  };

  return (
    <span 
      className="inline-flex items-center mr-1 tooltip" 
      title={`${badge.text}${badge.count ? ` (${badge.count})` : ''}`}
    >
      {getIcon()}
    </span>
  );
};

export default BadgeIcon;