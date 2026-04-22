// src/components/AccountSettings.tsx
import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Upload, User, Mail, Image as ImageIcon, Sun, Moon, Monitor, Lock, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AccountSettings = () => {
    const { user, login, logout } = useAuth(); // login updates the local AuthContext state
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    // Local states for text fields
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);

    // Password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 1. Update Text Details (Full Name and Email)
    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Hits router.route("/update-account").patch(verifyJWT, updateAccountDetails)
            const { data } = await api.patch("/users/update-account", { fullName, email });
            login({ user: data.data }); // Refresh global user state with response
            toast.success("Account details updated successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update details");
        } finally {
            setLoading(false);
        }
    };

    // 1.5 Change Password
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match");
        }
        
        setLoading(true);
        try {
            await api.post("/users/change-password", { oldPassword, newPassword });
            toast.success("Password changed successfully! Please log in again.");
            
            // Log out and redirect
            setTimeout(() => {
                logout();
                navigate("/login");
            }, 2000); // Give user a moment to see the success message
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    // 2. Update Avatar (File Upload)
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        setLoading(true);
        try {
            const { data } = await api.patch("/users/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            login({ user: data.data });
            toast.success("Avatar updated!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update avatar");
        } finally {
            setLoading(false);
        }
    };

    // 2. Update Cover Image (File Upload)
    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("coverImage", file); // Must match upload.single("coverImage")

        setLoading(true);
        try {
            // Hits router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
            const { data } = await api.patch("/users/cover-image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            login({ user: data.data });
            toast.success("Cover image updated!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update cover image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-[#1a1725] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 mt-10 transition-colors">
            <h2 className="text-2xl font-black mb-8 text-gray-900 dark:text-white">Account Settings</h2>

            {/* --- Avatar & Cover Section --- */}
            <div className="flex flex-col md:flex-row gap-8 mb-10">
                {/* Avatar */}
                <div className="shrink-0 flex flex-col items-center">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 w-full">
                        Profile Avatar
                    </label>
                    <div className="relative group w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#13111C]">
                        {user?.avatar?.url ? (
                            <img src={user.avatar.url} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <User size={40} />
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                            <Upload size={20} />
                            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Cover Image */}
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Profile Cover Image
                    </label>
                    <div className="relative h-32 w-full bg-gray-50 dark:bg-[#13111C] rounded-3xl overflow-hidden border border-dashed border-gray-200 dark:border-gray-800 group">
                        {user?.coverImage?.url ? (
                            <img src={user.coverImage.url} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon size={32} />
                            </div>
                        )}
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                            <Upload size={20} />
                            <input type="file" className="hidden" onChange={handleCoverImageChange} accept="image/*" />
                        </label>
                    </div>
                </div>
            </div>

            {/* --- Personal Info Form --- */}
            <form onSubmit={handleUpdateInfo} className="space-y-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Personal Information
                </label>

                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50 dark:shadow-blue-900/20"
                >
                    {loading ? "Syncing Changes..." : "Update Personal Info"}
                </button>
            </form>

            {/* --- Change Password Form --- */}
            <form onSubmit={handleChangePassword} className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Security & Password
                </label>

                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Current Password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="w-full border border-gray-200 dark:border-gray-800 dark:bg-[#13111C] dark:text-white dark:placeholder-gray-500 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Confirm New"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !oldPassword || !newPassword || !confirmPassword || oldPassword === newPassword || newPassword !== confirmPassword}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:grayscale dark:shadow-blue-900/20"
                >
                    {loading ? "Updating Security..." : "Change Password"}
                </button>
            </form>

            {/* --- Theme Preferences --- */}
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                    Theme Preferences
                </label>
                <div className="flex bg-gray-50 dark:bg-[#13111C] p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                            theme === "light"
                                ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f1b2e]"
                        }`}
                    >
                        <Sun size={18} /> Light
                    </button>
                    <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                            theme === "dark"
                                ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f1b2e]"
                        }`}
                    >
                        <Moon size={18} /> Dark
                    </button>
                    <button
                        onClick={() => setTheme("system")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${
                            theme === "system"
                                ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1f1b2e]"
                        }`}
                    >
                        <Monitor size={18} /> System
                    </button>
                </div>
            </div>
        </div>
    );
};