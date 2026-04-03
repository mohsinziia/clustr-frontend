import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export const Login = () => {
  const [userIdentifier, setUserIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Supports login via username OR email
      await api.post("/users/login", {
        username: userIdentifier,
        email: userIdentifier,
        password,
      });
      navigate("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Login to Clustr</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username or Email"
          onChange={(e) => setUserIdentifier(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2"
        />
        <button type="submit" className="bg-green-600 text-white p-2">
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        New to Clustr?{" "}
        <Link to="/register" className="text-blue-500">
          Create account
        </Link>
      </p>
    </div>
  );
};
