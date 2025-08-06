import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import socket from "../utils/socket";

interface AuthFlowProps {
  onSuccess: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<
    "method" | "input" | "otp" | "profile" | "success" | "login"
  >("method");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMethodSelect = (selectedMethod: "email" | "phone" | "login") => {
    if (selectedMethod === "login") {
      setStep("login");
    } else {
      setMethod(selectedMethod);
      setStep("input");
    }
    setError("");
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError("");
    try {
      await axios.post(
        "https://tawksee-backend.onrender.com/api/auth/request-otp",
        {
          contact,
        }
      );
      setStep("otp");
    } catch (error: any) {
      setError(error?.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!name.trim() || !username.trim()) {
        setError("Name and username are required");
        setIsLoading(false);
        return;
      }
      const response = await axios.post(
        "https://tawksee-backend.onrender.com/api/auth/verify-otp",
        {
          contact,
          otp: otp.join(""),
          name: name.trim(),
          username: username.trim(),
        }
      );
      const { token, user } = response.data;
      localStorage.setItem("funkychat-token", token);
      // Ensure user object has the correct structure
      const userWithId = {
        ...user,
        _id: user._id || user.id, // Handle both formats
        username: user.username || user._id || user.id, // Fallback to _id if username not present
      };
      localStorage.setItem("funkychat-user", JSON.stringify(userWithId));
      setStep("success");
      socket.disconnect();
      socket.auth = { token };
      socket.connect();
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setError(error?.response?.data?.error || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "https://tawksee-backend.onrender.com/api/auth/login",
        {
          username: username.trim(),
        }
      );
      const { token, user } = response.data;
      localStorage.setItem("funkychat-token", token);
      // Ensure user object has the correct structure
      const userWithId = {
        ...user,
        _id: user._id || user.id, // Handle both formats
        username: user.username || user._id || user.id, // Fallback to _id if username not present
      };
      localStorage.setItem("funkychat-user", JSON.stringify(userWithId));
      onSuccess();
    } catch (error: any) {
      setError(error?.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        {step === "method" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Choose your preferred verification method
            </p>
            <div className="space-y-4">
              <button
                onClick={() => handleMethodSelect("email")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Mail className="w-6 h-6" />
                Continue with Email
              </button>
              <button
                onClick={() => handleMethodSelect("phone")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Continue with Phone
              </button>
              <button
                onClick={() => handleMethodSelect("login")}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
              >
                Login with Username
              </button>
            </div>
          </div>
        )}
        {step === "input" && (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Enter your {method === "email" ? "Email" : "Phone Number"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              We'll send you a verification code
            </p>
            <input
              type={method === "email" ? "email" : "tel"}
              placeholder={
                method === "email" ? "your@email.com" : "+91 8578963223"
              }
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleSendOTP}
              disabled={!contact || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300 mt-4"
            >
              {isLoading ? "Sending..." : "Send Code"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === "otp" && (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Enter Verification Code
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              We sent a code to your {method === "email" ? "email" : "phone"}
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOTPChange(idx, e.target.value.replace(/\D/g, ""))
                  }
                  className="w-12 h-12 text-2xl text-center border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none bg-white/70 dark:bg-gray-700/70"
                />
              ))}
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50 mb-2"
              />
              <input
                type="text"
                placeholder="Choose a Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleVerifyOTP}
              disabled={otp.some((d) => !d) || !name || !username || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? "Verifying..." : "Verify & Signup"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === "login" && (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50 mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={!username || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}
        {step === "success" && (
          <div className="text-center">
            <div className="animate-bounce mb-4">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">
              Verification Successful! 🎉
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Taking you to your chats...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;
