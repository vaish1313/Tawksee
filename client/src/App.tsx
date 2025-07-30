import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthFlow from "./components/AuthFlow";
import ChatInterface from "./components/ChatInterface";
import { User } from "./types";

type AppState = "landing" | "auth" | "chat";

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
    // User is already set in localStorage by AuthFlow
    const savedUser = localStorage.getItem("funkychat-user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Ensure user object has the correct structure
      const userWithId = {
        ...userData,
        _id: userData._id || userData.id, // Handle both formats
        username: userData.username || userData._id || userData.id // Fallback to _id if username not present
      };
      setUser(userWithId);
      setCurrentState("chat");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("funkychat-user");
    localStorage.removeItem("funkychat-token");
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
