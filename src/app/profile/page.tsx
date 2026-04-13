"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, 
  Camera, 
  ChevronLeft, 
  Save, 
  MapPin, 
  Scale, 
  Target,
  Mail,
  Calendar
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = localStorage.getItem("user_profile");
    if (!p) {
      router.push("/onboarding");
      return;
    }
    setProfile(JSON.parse(p));
  }, [router]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("user_profile", JSON.stringify(profile));
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, profilePic: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="secondary" style={{ padding: '0.5rem' }} onClick={() => router.push("/dashboard")}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: '2rem' }}>Edit Profile</h1>
      </header>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={60} style={{ margin: '30px', color: '#cbd5e1' }} />
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '0.25rem', fontSize: '0.7rem', fontWeight: 700 }}
            >
              <Camera size={14} style={{ display: 'inline', marginRight: '4px' }} /> CHANGE
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleProfilePic} accept="image/*" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={14} /> Full Name
            </label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} /> Date of Birth
            </label>
            <input 
              type="date" 
              value={profile.dob} 
              onChange={e => setProfile({...profile, dob: e.target.value})}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} /> Country
            </label>
            <input 
              type="text" 
              value={profile.country} 
              onChange={e => setProfile({...profile, country: e.target.value})}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} /> State
            </label>
            <input 
              type="text" 
              value={profile.state} 
              onChange={e => setProfile({...profile, state: e.target.value})}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={14} /> Weight (kg)
            </label>
            <input 
              type="number" 
              value={profile.weight} 
              onChange={e => setProfile({...profile, weight: e.target.value})}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={14} /> Goal
            </label>
            <select 
              value={profile.goal} 
              onChange={e => setProfile({...profile, goal: e.target.value})}
            >
              <option value="Weight Gain">Weight Gain</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Healthy">Healthy</option>
              <option value="Muscle Gain">Muscle Gain</option>
            </select>
          </div>
        </div>

        <button 
          className="primary" 
          style={{ width: '100%', marginTop: '3rem' }} 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : <><Save size={18} /> Save Profile Changes</>}
        </button>
      </div>
    </div>
  );
}
