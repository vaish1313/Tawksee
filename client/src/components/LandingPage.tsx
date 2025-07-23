import React from "react";
import {
  MessageCircle,
  Sparkles,
  Video,
  Users,
  Shield,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 text-center text-white">
          <div className="animate-bounce mb-6">
            <MessageCircle className="w-20 h-20 mx-auto mb-4" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Tawksee
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Chat with style! The most fun and colorful messaging experience ever
            created 🚀
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 hover:text-purple-800 transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Get Started ✨
          </button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-pulse">
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </div>
        <div className="absolute top-32 right-16 animate-bounce delay-100">
          <Sparkles className="w-6 h-6 text-pink-300" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse delay-200">
          <Sparkles className="w-10 h-10 text-blue-300" />
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Why Choose Tawksee?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Video Calls
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Crystal clear video calls with screen sharing
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Group Chats
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create amazing groups with friends and family
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="bg-gradient-to-r from-pink-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                End-to-end encryption keeps your messages safe
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Messages delivered in real-time
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="bg-gradient-to-r from-yellow-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Fun Stickers
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Express yourself with animated stickers and emojis
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                Reactions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                React to messages with fun emojis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">Ready to make chatting fun again? 🎉</p>
          <button
            onClick={onGetStarted}
            className="mt-4 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 hover:text-purple-800 transform hover:scale-105 transition-all duration-300"
          >
            Start Chatting Now!
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
