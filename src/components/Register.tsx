// src/components/Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { toast } from "sonner";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useCallback } from "react";

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Username status states
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) =>
      data.append(key, formData[key as keyof typeof formData]),
    );

    try {
      await api.post("/users/register", data);
      toast.success("Check your email for the verification code!");
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Debounced Username Availability Check
  useEffect(() => {
    if (!formData.username.trim()) {
      setIsUsernameAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingUsername(true);
      try {
        const { data } = await api.get(`/users/check-username/${formData.username}`);
        setIsUsernameAvailable(data.data.available);
      } catch (err) {
        console.error("Username check failed", err);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // AI Username Generation
  const handleGenerateUsername = async () => {
    setIsGenerating(true);
    try {

      const { data } = await api.post("/users/generate-username", {});

      const candidate = data.data.username;
      setFormData(prev => ({ ...prev, username: candidate }));
      toast.success("AI generated a unique username!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "AI Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#13111C] p-6 transition-colors">
      <div className="max-w-md w-full p-10 bg-white dark:bg-[#1a1725] shadow-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center transition-all">
        <Logo size={56} className="mb-6" />
        <h2 className="text-3xl font-black mb-8 text-center text-gray-900 dark:text-white tracking-tight w-full">Join Clustr</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <div className="relative group">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
              required
              className={`w-full border ${isUsernameAvailable === true ? "border-green-500 focus:ring-green-500" :
                isUsernameAvailable === false ? "border-red-500 focus:ring-red-500" :
                  "border-gray-200 dark:border-gray-800"
                } dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 p-4 pr-24 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
            />

            {/* Action Buttons & Status Icons */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isCheckingUsername ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : isUsernameAvailable === true ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : isUsernameAvailable === false ? (
                <X className="w-5 h-5 text-red-500" />
              ) : null}

              <button
                type="button"
                onClick={handleGenerateUsername}
                disabled={isGenerating}
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                title="Generate AI Username"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />

          <button
            type="submit"
            disabled={loading || isUsernameAvailable === false || isCheckingUsername}
            className="bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 mt-4 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? "Creating Account..." : "Register & Login"}
          </button>
        </form>

        <p className="mt-10 text-sm text-center text-gray-500 dark:text-gray-400 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};