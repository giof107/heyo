import React, { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';

interface SettingsProps {
  isModMode: boolean;
  onModModeChange: (value: boolean) => void;
  bannedWords: string[];
  onBannedWordsChange: (words: string[]) => void;
  isDark: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  isModMode,
  onModModeChange,
  bannedWords,
  onBannedWordsChange,
  isDark,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bannedWordsInput, setBannedWordsInput] = useState('');

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

  const removeBannedWord = (word: string) => {
    onBannedWordsChange(bannedWords.filter(w => w !== word));
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
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold dark:text-white">Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 dark:text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
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
                <h4 className="font-semibold mb-2 dark:text-white">Banned Words</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={bannedWordsInput}
                    onChange={(e) => setBannedWordsInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    placeholder="Add words (comma-separated)"
                  />
                  <button
                    onClick={handleBannedWordsSubmit}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings