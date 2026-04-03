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
    if (avatar) data.append("avatar", avatar); // Matches multer.middleware

    try {
      // Register
      await api.post("/users/register", data);
      // Auto-Login
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
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Register for Clustr</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Full Name"
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Username"
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
          className="border p-2"
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          className="border p-2"
        />
        <label className="text-sm">
          Avatar:{" "}
          <input
            type="file"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2"
        >
          {loading ? "Processing..." : "Register & Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500">
          Login here
        </Link>
      </p>
    </div>
  );
};
