import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OTPInput, type SlotProps } from "input-otp";
import api from "../api/axios";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email missing. Please register again.");
      navigate("/register");
    }
  }, [email, navigate]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      const res = await api.post("/users/verify-otp", { email, otp });
      toast.success("Email verified successfully!");

      // Auto login or redirect to login
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/users/send-otp", { email });
      toast.success("New code sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#13111C] p-6 transition-colors">
      <div className="max-w-md w-full p-10 bg-white dark:bg-[#1a1725] shadow-2xl rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center transition-all">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="text-3xl font-black mb-2 text-center text-gray-900 dark:text-white tracking-tight">Verify Email</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 font-medium">
          Enter the 6-digit code sent to <br />
          <span className="text-blue-600 dark:text-blue-400 font-bold">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="flex flex-col items-center gap-8 w-full">
          <OTPInput
            maxLength={6}
            value={otp}
            onChange={setOtp}
            containerClassName="group flex items-center gap-2 has-[:disabled]:opacity-50"
            render={({ slots }) => (
              <div className="flex gap-2">
                {slots.map((slot, idx) => (
                  <Slot key={idx} {...slot} />
                ))}
              </div>
            )}
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 dark:shadow-blue-900/20 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </div>
            ) : "Verify & Continue"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4 disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
};

function Slot(props: SlotProps) {
  return (
    <div
      className={`relative w-12 h-14 flex items-center justify-center text-2xl font-black transition-all duration-200 border-2 rounded-xl
        ${props.isActive
          ? "border-blue-600 ring-4 ring-blue-500/10 dark:ring-blue-400/10 scale-105"
          : "border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white"
        }
        ${props.char ? "bg-white dark:bg-[#13111C]" : "bg-gray-50/50 dark:bg-[#13111C]/50"}
      `}
    >
      {props.char}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-caret-blink bg-blue-600 duration-1000" />
        </div>
      )}
    </div>
  );
}
