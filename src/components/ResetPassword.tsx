import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import { Logo } from "./Logo";
import { toast } from "sonner";
import { KeyRound, Lock, ArrowLeft } from "lucide-react";

export const ResetPassword = () => {
  const location = useLocation();
  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users/reset-password", { email, otp, newPassword });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#13111C] p-6">
      <div className="max-w-md w-full p-10 bg-white dark:bg-[#1a1725] shadow-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center">
        <Logo size={56} className="mb-6" />
        <h2 className="text-3xl font-black mb-4 text-center text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
          Enter the OTP sent to <span className="text-blue-600 dark:text-blue-400">{email}</span> and your new password.
        </p>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-5 w-full">
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-[0.5em] text-center font-bold"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !otp || !newPassword || !confirmPassword}
            className="bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link 
          to="/forgot-password" 
          className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Change Email
        </Link>
      </div>
    </div>
  );
};
