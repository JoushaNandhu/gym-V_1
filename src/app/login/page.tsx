"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setTimeout(() => {
      if (otp === "123456") {
        localStorage.setItem("user_session", JSON.stringify({ identifier, authenticated: true }));
        router.push("/onboarding");
      } else {
        alert("Invalid OTP. Use 123456");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card"
        style={{ width: '100%', maxWidth: '480px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px var(--primary-glow)' }}>
             <Sparkles color="white" size={32} />
          </div>
          <h1 className="glitter-text" style={{ fontSize: '2.5rem' }}>GymV1</h1>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{step === 1 ? "Premium AI Health Companion" : "Identity Verification"}</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendOtp}
            >
              <div>
                <label>Email or Mobile Number</label>
                <input
                  type="text"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="primary" style={{ width: '100%', marginTop: '2.5rem' }} disabled={loading}>
                {loading ? "Initializing..." : "Get OTP Code"} <ArrowRight size={18} />
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp}
            >
              <div>
                <label>Verification Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 900 }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem', textAlign: 'center' }}>
                  A code has been sent to your device.
                </p>
              </div>
              <button type="submit" className="primary" style={{ width: '100%', marginTop: '2.5rem' }} disabled={loading}>
                {loading ? "Verifying..." : "Access Dashboard"} <ShieldCheck size={18} />
              </button>
              <button 
                type="button" 
                className="secondary" 
                style={{ width: '100%', marginTop: '1rem' }} 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Change Details
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

import { AnimatePresence } from "framer-motion";
