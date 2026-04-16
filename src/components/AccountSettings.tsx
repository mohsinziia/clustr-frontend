// src/components/AccountSettings.tsx
import React, { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Upload, User, Mail, Image as ImageIcon } from "lucide-react";

export const AccountSettings = () => {
    const { user, login } = useAuth(); // login updates the local AuthContext state

    // Local states for text fields
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);

    // 1. Update Text Details (Full Name and Email)
    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Hits router.route("/update-account").patch(verifyJWT, updateAccountDetails)
            const { data } = await api.patch("/users/update-account", { fullName, email });
            login({ user: data.data }); // Refresh global user state with response
            alert("Account details updated successfully!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update details");
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
            alert("Cover image updated!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update cover image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border mt-10">
            <h2 className="text-2xl font-black mb-8 text-gray-900">Account Settings</h2>

            {/* --- Cover Image Section --- */}
            <div className="mb-10">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                    Profile Cover Image
                </label>
                <div className="relative h-48 w-full bg-gray-100 rounded-2xl overflow-hidden mb-4 border border-dashed border-gray-300 group">
                    {user?.coverImage?.url ? (
                        <img src={user.coverImage.url} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={48} strokeWidth={1} />
                        </div>
                    )}

                    {/* Overlay Upload Trigger */}
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        <Upload size={24} className="mb-2" />
                        <span className="font-bold text-sm">Upload New Cover</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleCoverImageChange}
                            accept="image/*"
                        />
                    </label>
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
                        className="w-full border border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full border border-gray-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                    {loading ? "Syncing Changes..." : "Update Personal Info"}
                </button>
            </form>
        </div>
    );
};