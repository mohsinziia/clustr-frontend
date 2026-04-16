// src/components/Register.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) =>
      data.append(key, formData[key as keyof typeof formData]),
    );
    if (avatar) data.append("avatar", avatar);

    try {
      await api.post("/users/register", data);
      await api.post("/users/login", {
        username: formData.username,
        password: formData.password,
      });
      navigate("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black mb-6 text-center text-gray-900">Join Clustr</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />

          <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
              Profile Avatar
            </label>
            <input
              type="file"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              required
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 mt-2 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register & Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};