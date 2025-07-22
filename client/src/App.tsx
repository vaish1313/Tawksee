import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthFlow from "./components/AuthFlow";
import ProfileSetup from "./components/ProfileSetup";
import ChatInterface from "./components/ChatInterface";
import { User, Chat } from "./types";

type AppState = "landing" | "auth" | "profile" | "chat";

function App() {
  const [currentState, setCurrentState] = useState<AppState>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check for saved user and theme
    const savedUser = localStorage.getItem("funkychat-user");
    const savedTheme = localStorage.getItem("funkychat-theme") as
      | "light"
      | "dark";

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentState("chat");
    }

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const handleAuthSuccess = () => {
    setCurrentState("profile");
  };

  const handleProfileComplete = (userData: User) => {
    setUser(userData);
    localStorage.setItem("funkychat-user", JSON.stringify(userData));
    setCurrentState("chat");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("funkychat-user");
    setCurrentState("landing");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("funkychat-theme", newTheme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 transition-all duration-300">
      {currentState === "landing" && (
        <LandingPage onGetStarted={() => setCurrentState("auth")} />
      )}
      {currentState === "auth" && <AuthFlow onSuccess={handleAuthSuccess} />}
      {currentState === "profile" && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}
      {currentState === "chat" && user && (
        <ChatInterface
          user={user}
          theme={theme}
          onLogout={handleLogout}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
