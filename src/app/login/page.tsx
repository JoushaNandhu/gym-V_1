"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: identifier, 2: otp
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    // Mock sending OTP
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    // Mock verification
    setTimeout(() => {
      if (otp === "123456") {
        localStorage.setItem("user_session", JSON.stringify({ identifier, authenticated: true }));
        router.push("/onboarding");
      } else {
        alert("Invalid OTP. Use 123456 for testing.");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="step-header">
          <h1>Welcome to GymV1</h1>
          <p>{step === 1 ? "Enter your email or mobile number to continue" : "Enter the 6-digit code sent to you"}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <label htmlFor="identifier">Email / Mobile Number</label>
            <input
              id="identifier"
              type="text"
              placeholder="e.g. +91 9876543210 or name@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <button type="submit" className="primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? "Sending..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <label htmlFor="otp">OTP Code</label>
            <input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
              Hint: Use 123456
            </p>
            <button type="submit" className="primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button 
              type="button" 
              className="secondary" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
