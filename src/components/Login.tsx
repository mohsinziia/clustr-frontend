// src/components/Login.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const [userIdentifier, setUserIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", {
        username: userIdentifier,
        email: userIdentifier,
        password,
      });
      login(res.data.data);
      navigate("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black mb-6 text-center text-gray-900">Login to Clustr</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username or Email"
            onChange={(e) => setUserIdentifier(e.target.value)}
            required
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-100 mt-2"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500 font-medium">
          New to Clustr?{" "}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};