import React, { useState, useEffect } from "react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { User } from "../types";

interface CallInterfaceProps {
  callType: "audio" | "video";
  participant: User;
  onEndCall: () => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
  callType,
  participant,
  onEndCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<
    "connecting" | "connected" | "ended"
  >("connecting");

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: number;

    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(onEndCall, 1000);
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-500 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500 rounded-full animate-ping"></div>
      </div>

      {/* Call Header */}
      <div className="relative z-10 p-6 text-center text-white">
        <div className="mb-4">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20 shadow-2xl"
          />
          <h2 className="text-2xl font-bold mb-2">{participant.name}</h2>
          <div className="flex items-center justify-center gap-2">
            {callType === "video" ? (
              <Video className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            <span className="text-lg">
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "connected" && formatDuration(callDuration)}
              {callStatus === "ended" && "Call Ended"}
            </span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      {callType === "video" && callStatus === "connected" && (
        <div className="flex-1 relative p-4">
          {/* Main Video */}
          <div className="w-full h-full bg-gray-800 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-75">Video call in progress</p>
              </div>
            </div>

            {/* Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-white/20 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Visualization */}
      {callType === "audio" && callStatus === "connected" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 20}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Call Controls */}
      <div className="relative z-10 p-6">
        <div className="flex justify-center items-center gap-4">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Speaker Button (Audio only) */}
          {callType === "audio" && (
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isSpeakerOn
                  ? "bg-white/20 hover:bg-white/30"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Video Toggle (Video only) */}
          {callType === "video" && (
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Screen Share (Video only) */}
          {callType === "video" && (
            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
                isScreenSharing
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-white/20 hover:bg-white/30"
              }`}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-6 h-6 text-white" />
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Call Status */}
        {callStatus === "connecting" && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 text-white/80">
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
              <span>Connecting...</span>
            </div>
          </div>
        )}

        {isScreenSharing && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 text-blue-300">
              <Monitor className="w-4 h-4" />
              <span>Screen sharing active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallInterface;
