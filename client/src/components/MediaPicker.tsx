import React from "react";
import { Camera, Image, FileText, Mic } from "lucide-react";

interface MediaPickerProps {
  onMediaSelect: (type: "camera" | "gallery" | "file" | "audio") => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onMediaSelect }) => {
  const mediaOptions = [
    {
      type: "camera" as const,
      icon: Camera,
      label: "Camera",
      color: "from-green-500 to-emerald-500",
    },
    {
      type: "gallery" as const,
      icon: Image,
      label: "Gallery",
      color: "from-blue-500 to-cyan-500",
    },
    {
      type: "file" as const,
      icon: FileText,
      label: "Document",
      color: "from-orange-500 to-red-500",
    },
    {
      type: "audio" as const,
      icon: Mic,
      label: "Audio",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-600">
      <div className="grid grid-cols-2 gap-3 w-48">
        {mediaOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => onMediaSelect(option.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${option.color} text-white hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MediaPicker;
