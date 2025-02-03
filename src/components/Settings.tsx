import React, { useState } from 'react';
import { Settings as SettingsIcon, X } from 'lucide-react';

interface SettingsProps {
  filters: {
    showModOnly: boolean;
    showStreamerOnly: boolean;
  };
  onFilterChange: (filters: any) => void;
  bannedWords: string[];
  onBannedWordsChange: (words: string[]) => void;
}

const Settings: React.FC<SettingsProps> = ({
  filters,
  onFilterChange,
  bannedWords,
  onBannedWordsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newWord, setNewWord] = useState('');

  const addBannedWord = () => {
    if (newWord && !bannedWords.includes(newWord)) {
      onBannedWordsChange([...bannedWords, newWord]);
      setNewWord('');
    }
  };

  const removeBannedWord = (word: string) => {
    onBannedWordsChange(bannedWords.filter(w => w !== word));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-4">Settings</h3>
          
          <div className="space-y-2 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showModOnly}
                onChange={(e) => onFilterChange({ ...filters, showModOnly: e.target.checked })}
                className="mr-2"
              />
              Show Moderator Messages Only
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showStreamerOnly}
                onChange={(e) => onFilterChange({ ...filters, showStreamerOnly: e.target.checked })}
                className="mr-2"
              />
              Show Streamer Messages Only
            </label>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Banned Words</h4>
            <div className="flex mb-2">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="flex-1 border rounded-l px-2 py-1"
                placeholder="Add new word..."
              />
              <button
                onClick={addBannedWord}
                className="bg-blue-500 text-white px-3 py-1 rounded-r"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {bannedWords.map((word) => (
                <span
                  key={word}
                  className="bg-gray-100 px-2 py-1 rounded-full flex items-center"
                >
                  {word}
                  <X
                    className="w-4 h-4 ml-1 cursor-pointer"
                    onClick={() => removeBannedWord(word)}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;