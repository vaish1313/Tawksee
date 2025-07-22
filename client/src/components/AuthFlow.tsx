import { useState } from "react";
import { Mail, Phone, ArrowRight, CheckCircle } from "lucide-react";
import axios from "axios";

interface AuthFlowProps {
  onSuccess: () => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<"method" | "input" | "otp" | "success">(
    "method"
  );
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodSelect = (selectedMethod: "email" | "phone") => {
    setMethod(selectedMethod);
    setStep("input");
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      axios.post("http://localhost:5000/api/auth/request-otp", { contact });

      setStep("otp");
    } catch (error: any) {
      alert(error?.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          contact,
          otp: otp.join(""),
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token); // optionally store JWT
      setStep("success");

      setTimeout(() => {
        onSuccess(); // can be navigation or redirect
      }, 1500);
    } catch (error: any) {
      alert(error?.response?.data?.error || "OTP verification failed");
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

            <div className="space-y-4">
              <input
                type={method === "email" ? "email" : "tel"}
                placeholder={
                  method === "email" ? "your@email.com" : "+1 (555) 123-4567"
                }
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50"
              />

              <button
                onClick={handleSendOTP}
                disabled={!contact || isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300"
              >
                {isLoading ? (
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    Send Code <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Enter Verification Code
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              We sent a code to {contact}
            </p>

            <div className="flex gap-2 mb-6 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-bold rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 outline-none transition-colors bg-white/50 dark:bg-gray-700/50"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={otp.join("").length !== 6 || isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  Verify Code <ArrowRight className="w-5 h-5" />
                </>
              )}
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
              Taking you to setup your profile...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;
