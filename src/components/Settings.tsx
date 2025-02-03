import React, { useState } from 'react';
import { Settings as SettingsIcon, X, User, Shield } from 'lucide-react';

interface SettingsProps {
  isModMode: boolean;
  onModModeChange: (value: boolean) => void;
  bannedWords: string[];
  onBannedWordsChange: (words: string[]) => void;
  isDark: boolean;
  trackedUsers: string[];
  onTrackedUsersChange: (users: string[]) => void;
  onTimeoutUser?: (username: string, duration: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  isModMode,
  onModModeChange,
  bannedWords,
  onBannedWordsChange,
  isDark,
  trackedUsers,
  onTrackedUsersChange,
  onTimeoutUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bannedWordsInput, setBannedWordsInput] = useState('');
  const [trackedUserInput, setTrackedUserInput] = useState('');
  const [timeoutUsername, setTimeoutUsername] = useState('');
  const [timeoutDuration, setTimeoutDuration] = useState(300); // 5 minutes default

  const handleBannedWordsSubmit = () => {
    if (bannedWordsInput.trim()) {
      const newWords = bannedWordsInput
        .split(',')
        .map(word => word.trim())
        .filter(word => word && !bannedWords.includes(word));
      
      if (newWords.length > 0) {
        onBannedWordsChange([...bannedWords, ...newWords]);
        setBannedWordsInput('');
      }
    }
  };

  const handleTrackedUserSubmit = () => {
    if (trackedUserInput.trim() && !trackedUsers.includes(trackedUserInput.trim())) {
      onTrackedUsersChange([...trackedUsers, trackedUserInput.trim()]);
      setTrackedUserInput('');
    }
  };

  const handleTimeoutSubmit = () => {
    if (timeoutUsername.trim() && onTimeoutUser) {
      onTimeoutUser(timeoutUsername.trim(), timeoutDuration);
      setTimeoutUsername('');
    }
  };

  const removeBannedWord = (word: string) => {
    onBannedWordsChange(bannedWords.filter(w => w !== word));
  };

  const removeTrackedUser = (username: string) => {
    onTrackedUsersChange(trackedUsers.filter(u => u !== username));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <SettingsIcon className="w-5 h-5 dark:text-white" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 dark:text-white" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 dark:text-white">
                  <input
                    type="checkbox"
                    checked={isModMode}
                    onChange={(e) => onModModeChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Moderator Mode</span>
                </label>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 dark:text-white" />
                  <h4 className="font-semibold dark:text-white">Track Users</h4>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={trackedUserInput}
                    onChange={(e) => setTrackedUserInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-white"
                    placeholder="Enter username to track"
                  />
                  <button
                    onClick={handleTrackedUserSubmit}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                  >
                    Track
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-4">
                  {trackedUsers.map((username) => (
                    <span
                      key={username}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    >
                      {username}
                      <button
                        onClick={() => removeTrackedUser(username)}
                        className="ml-1 p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 dark:text-white" />
                  <h4 className="font-semibold dark:text-white">Banned Words</h4>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={bannedWordsInput}
                    onChange={(e) => setBannedWordsInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-white"
                    placeholder="Add words (comma-separated)"
                  />
                  <button
                    onClick={handleBannedWordsSubmit}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {bannedWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {word}
                      <button
                        onClick={() => removeBannedWord(word)}
                        className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {isModMode && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 dark:text-white" />
                    <h4 className="font-semibold dark:text-white">Timeout User</h4>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={timeoutUsername}
                      onChange={(e) => setTimeoutUsername(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-white"
                      placeholder="Username"
                    />
                    <select
                      value={timeoutDuration}
                      onChange={(e) => setTimeoutDuration(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-white"
                    >
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                      <option value={600}>10 minutes</option>
                      <option value={3600}>1 hour</option>
                      <option value={86400}>24 hours</option>
                    </select>
                    <button
                      onClick={handleTimeoutSubmit}
                      className="w-full px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                    >
                      Timeout User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;