"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Scale, 
  Edit2, 
  User as UserIcon, 
  Zap, 
  ChevronRight,
  Microscope,
  Utensils,
  Dna,
  LayoutDashboard
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [isEditingBmi, setIsEditingBmi] = useState(false);

  useEffect(() => {
    const p = localStorage.getItem("user_profile");
    if (!p) { router.push("/onboarding"); return; }
    const data = JSON.parse(p);
    setProfile(data);
    calculateBmi(data.weight, data.height, data.heightUnit);
  }, [router]);

  const calculateBmi = (weight: any, height: any, unit: string) => {
    let heightInMeters = parseFloat(height);
    if (!heightInMeters || !weight) return;
    if (unit === "feet") heightInMeters = heightInMeters * 0.3048;
    else heightInMeters = heightInMeters / 100;
    const val = parseFloat(weight) / (heightInMeters * heightInMeters);
    setBmi(Math.round(val * 10) / 10);
  };

  if (!profile) return null;

  return (
    <div className="container" style={{ minHeight: '100vh', background: '#fdfdfd' }}>
      <header style={{ marginBottom: '6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '100px', height: '100px', borderRadius: '3rem', background: 'var(--primary)', position: 'relative', overflow: 'hidden', border: '5px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : ( <UserIcon color="white" size={40} /> )}
          </div>
          <div>
            <span className="badge">Vanguard Elite Member</span>
            <h1 className="glitter-text" style={{ fontSize: '3.5rem', marginTop: '0.5rem' }}>{profile.name}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', fontWeight: 600 }}>{profile.age} • {profile.state}, {profile.country}</p>
          </div>
        </div>
        <button className="secondary" style={{ borderRadius: '4rem' }} onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>
          SECURE LOGOUT
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', marginBottom: '6rem' }}>
        {/* Physical Stats Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
             <p style={{ fontWeight: 900, color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>BIOMETRIC INDEX</p>
             <div style={{ width: '160px', height: '160px', background: 'var(--primary)', borderRadius: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '4rem', fontWeight: 950, margin: '0 auto 2rem', boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4)' }}>
                {bmi}
             </div>
             <p style={{ fontSize: '2rem', fontWeight: 950, color: '#3b82f6' }}>
               {bmi && bmi < 18.5 ? "DIVERGENT" : bmi && bmi < 25 ? "OPTIMAL" : "CRITICAL"}
             </p>
          </div>

          <div className="card" style={{ background: '#020617', color: 'white', padding: '3.5rem' }}>
             <p style={{ opacity: 0.6, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.4em' }}>CORE EVOLUTION</p>
             <h2 style={{ fontSize: '2.5rem', margin: '1rem 0', fontWeight: 950 }}>{profile.goal}</h2>
             <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginTop: '1.5rem' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} style={{ height: '100%', background: 'white' }} />
             </div>
          </div>
        </div>

        {/* Agent Access Hub */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          <motion.div 
            whileHover={{ y: -10 }}
            className="card" 
            style={{ cursor: 'pointer', padding: '4rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            onClick={() => router.push("/dashboard/reports")}
          >
            <div style={{ background: '#3b82f615', width: '80px', height: '80px', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Microscope size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 950 }}>Quantum Analyzer</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>Spectral decomposition of health documents and blood matrixes.</p>
            </div>
            <button className="primary" style={{ width: 'fit-content', padding: '0.75rem 2rem' }}>LAUNCH AGENT_7 <ChevronRight size={18} /></button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="card" 
            style={{ cursor: 'pointer', padding: '4rem 3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            onClick={() => router.push("/dashboard/nutrition")}
          >
            <div style={{ background: '#f59e0b15', width: '80px', height: '80px', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Utensils size={40} />
            </div>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 950 }}>Bio-Kinetic Diet</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>Identification of molecular nutrients and goal-based architecting.</p>
            </div>
            <button className="primary" style={{ width: 'fit-content', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>LAUNCH AGENT_12 <ChevronRight size={18} /></button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
