import React, { useState } from "react";
import { Camera, ArrowRight } from "lucide-react";
import { User } from "../types";

interface ProfileSetupProps {
  onComplete: (user: User) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [statusEmoji, setStatusEmoji] = useState("😊");
  const [isLoading, setIsLoading] = useState(false);

  const avatars = [
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpg?auto=compress&cs=tinysrgb&w=150",
  ];

  const statusEmojis = [
    "😊",
    "🚀",
    "🎉",
    "💫",
    "🔥",
    "✨",
    "🌟",
    "🎨",
    "🎵",
    "🦄",
    "🌈",
    "💎",
  ];

  const handleComplete = async () => {
    if (!name || !selectedAvatar) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user: User = {
        id: Date.now().toString(),
        name,
        avatar: selectedAvatar,
        status: "Hey there! I am using FunkyChat",
        statusEmoji,
        isOnline: true,
      };

      onComplete(user);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Set Up Your Profile ✨
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Make your profile funky and unique!
        </p>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your funky name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose Your Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                    selectedAvatar === avatar
                      ? "border-purple-500 ring-4 ring-purple-200 transform scale-105"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Funky Status Emoji
            </label>
            <div className="grid grid-cols-6 gap-2">
              {statusEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setStatusEmoji(emoji)}
                  className={`p-2 rounded-lg text-2xl transition-all duration-300 ${
                    statusEmoji === emoji
                      ? "bg-purple-500 ring-4 ring-purple-200 transform scale-110"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={!name || !selectedAvatar || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300"
          >
            {isLoading ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <>
                Let's Chat! <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
