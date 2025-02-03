import React from 'react';
import { Badge } from '../types/chat';

// Import SVG badges
import streamerBadge from '../assets/icons/badges/streamer.svg';
import founderBadge from '../assets/icons/badges/founder.svg';
import moderatorBadge from '../assets/icons/badges/moderator.svg';
import ogBadge from '../assets/icons/badges/og.svg';
import vipBadge from '../assets/icons/badges/vip.svg';

const BadgeIcon: React.FC<{ badge: Badge }> = ({ badge }) => {
  const getBadgeIcon = () => {
    if (badge.image) {
      return badge.image;
    }

    switch (badge.type) {
      case 'streamer':
        return streamerBadge;
      case 'founder':
        return founderBadge;
      case 'moderator':
        return moderatorBadge;
      case 'og':
        return ogBadge;
      case 'vip':
        return vipBadge;
      default:
        return null;
    }
  };

  const badgeIcon = getBadgeIcon();
  if (!badgeIcon) return null;

  return (
    <img
      src={badgeIcon}
      alt={`${badge.type} badge`}
      title={`${badge.text}${badge.count ? ` (${badge.count})` : ''}`}
      className="w-4 h-4 inline-block"
    />
  );
};

export default BadgeIcon;