// src/components/Login.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import { toast } from "sonner";

export const Login = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      username: userIdentifier,
      email: userIdentifier,
      password,
    };
    try {
      const { data } = await api.post("/users/login", formData);
      login(data.data);
      toast.success("Welcome back to Clustr!");
      navigate("/");
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("Please verify your email first!");
        navigate("/verify-email", { state: { email: err.response.data.data.email } });
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#13111C] p-6 transition-colors">
      <div className="max-w-md w-full p-10 bg-white dark:bg-[#1a1725] shadow-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center transition-all">
        <Logo size={56} className="mb-6" />
        <h2 className="text-3xl font-black mb-8 text-center text-gray-900 dark:text-white tracking-tight w-full">Login to Clustr</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
          <input
            type="text"
            placeholder="Username or Email"
            onChange={(e) => setUserIdentifier(e.target.value)}
            required
            className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <div className="flex justify-end mt-2 px-1">
              <Link 
                to="/forgot-password" 
                className="text-xs font-bold text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 mt-4 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-10 text-sm text-center text-gray-500 dark:text-gray-400 font-medium">
          New to Clustr?{" "}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};