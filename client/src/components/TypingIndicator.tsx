import React from "react";

interface TypingIndicatorProps {
  avatar: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ avatar }) => {
  return (
    <div className="flex items-center gap-3">
      <img src={avatar} alt="Typing..." className="w-8 h-8 rounded-full" />
      <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
