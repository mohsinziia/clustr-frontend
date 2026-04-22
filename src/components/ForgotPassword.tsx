import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Logo } from "./Logo";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email });
      toast.success("OTP sent to your email!");
      navigate("/reset-password", { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#13111C] p-6">
      <div className="max-w-md w-full p-10 bg-white dark:bg-[#1a1725] shadow-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center">
        <Logo size={56} className="mb-6" />
        <h2 className="text-3xl font-black mb-4 text-center text-gray-900 dark:text-white tracking-tight">Forgot Password?</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
          Enter your email and we'll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleRequestOTP} className="flex flex-col gap-5 w-full">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <Link 
          to="/login" 
          className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};
