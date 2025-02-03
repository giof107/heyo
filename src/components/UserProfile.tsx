import React, { useEffect, useRef } from 'react';
import { X, UserPlus, UserMinus } from 'lucide-react';

interface UserProfileProps {
  username: string;
  position: { x: number; y: number };
  onClose: () => void;
  onTrackUser?: (username: string) => void;
  isTracked: boolean;
  recentMessages: Array<{ content: string; timestamp: string }>;
}

const UserProfile: React.FC<UserProfileProps> = ({
  username,
  position,
  onClose,
  onTrackUser,
  isTracked,
  recentMessages
}) => {
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to keep profile in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 320),
    y: Math.min(position.y, window.innerHeight - 400)
  };

  return (
    <div
      ref={profileRef}
      className="fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Placeholder avatar */}
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                {username[0].toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white">{username}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Joined Dec 2023</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={() => onTrackUser?.(username)}
            className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
              isTracked
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400'
            }`}
          >
            {isTracked ? (
              <>
                <UserMinus className="w-4 h-4" />
                Untrack User
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Track User
              </>
            )}
          </button>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-300">Recent Messages</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentMessages.map((message, index) => (
              <div key={index} className="text-sm">
                <p className="text-gray-900 dark:text-gray-100 break-words">
                  {message.content}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {message.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;