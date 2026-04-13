"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Activity, 
  FileText, 
  Utensils, 
  Scale, 
  Edit2, 
  ChevronRight,
  Stethoscope,
  Droplets,
  Pill,
  RefreshCw
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [isEditingBmi, setIsEditingBmi] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [dislikedFood, setDislikedFood] = useState("");

  useEffect(() => {
    const p = localStorage.getItem("user_profile");
    if (!p) {
      router.push("/onboarding");
      return;
    }
    const data = JSON.parse(p);
    setProfile(data);
    calculateBmi(data.weight, data.height, data.heightUnit);
  }, [router]);

  const calculateBmi = (weight: any, height: any, unit: string) => {
    let heightInMeters = parseFloat(height);
    if (unit === "feet") {
      heightInMeters = heightInMeters * 0.3048;
    } else {
      heightInMeters = heightInMeters / 100;
    }
    const val = parseFloat(weight) / (heightInMeters * heightInMeters);
    setBmi(Math.round(val * 10) / 10);
  };

  const handleUpdateBmi = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile = { ...profile };
    localStorage.setItem("user_profile", JSON.stringify(newProfile));
    calculateBmi(newProfile.weight, newProfile.height, newProfile.heightUnit);
    setIsEditingBmi(false);
  };

  const generateDiet = async () => {
    setLoadingDiet(true);
    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        body: JSON.stringify({
          goal: profile.goal,
          country: profile.country,
          state: profile.state,
          forbiddenFood: dislikedFood
        })
      });
      const data = await res.json();
      setDietPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDiet(false);
    }
  };

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Hello, {profile.name}!</h1>
          <p style={{ color: 'var(--muted)' }}>Here's your health summary</p>
        </div>
        <button className="secondary" onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>Logout</button>
      </header>

      {/* Reports Section */}
      <section style={{ marginBottom: '2rem' }}>
        <button 
          className="card" 
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => setShowReports(!showReports)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileText size={20} />
            <span style={{ fontWeight: 600 }}>Health Analysis Reports</span>
          </div>
          <ChevronRight style={{ transform: showReports ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
        </button>

        {showReports && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}
          >
            <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
              <Stethoscope size={24} style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Medical Report Analyzer</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Future Feature</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
              <Droplets size={24} style={{ marginBottom: '0.5rem', color: '#ef4444' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Blood Test Analyzer</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Future Feature</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
              <Pill size={24} style={{ marginBottom: '0.5rem', color: '#3b82f6' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Medication Analyzer</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Future Feature</p>
            </div>
          </motion.div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* BMI Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={20} /> BMI
            </h3>
            <button className="secondary" style={{ padding: '0.4rem' }} onClick={() => setIsEditingBmi(!isEditingBmi)}>
              <Edit2 size={14} />
            </button>
          </div>
          
          {isEditingBmi ? (
            <form onSubmit={handleUpdateBmi}>
              <label style={{ fontSize: '0.8rem' }}>Weight (kg)</label>
              <input 
                type="number" 
                value={profile.weight} 
                onChange={e => setProfile({...profile, weight: e.target.value})}
              />
              <label style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>Height ({profile.heightUnit})</label>
              <input 
                type="number" 
                value={profile.height} 
                onChange={e => setProfile({...profile, height: e.target.value})}
              />
              <button type="submit" className="primary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }}>Save</button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700 }}>{bmi}</span>
              <p style={{ color: 'var(--muted)', fontWeight: 500 }}>
                {bmi && bmi < 18.5 ? "Underweight" : bmi && bmi < 25 ? "Healthy Weight" : "Overweight"}
              </p>
            </div>
          )}
        </div>

        {/* Goal Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <Activity size={32} style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Current Goal</p>
          <h3 style={{ fontSize: '1.5rem' }}>{profile.goal}</h3>
        </div>
      </div>

      {/* Diet Plan Section */}
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Utensils size={20} /> AI Diet Plan
          </h3>
          <button className="primary" onClick={generateDiet} disabled={loadingDiet}>
            {dietPlan ? "Regenerate" : "Generate Plan"}
          </button>
        </div>

        {!dietPlan && !loadingDiet && (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
            Get a personalized diet plan based on your goal and region.
          </p>
        )}

        {loadingDiet && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <RefreshCw size={32} className="spinning" style={{ margin: '0 auto', animation: 'spin 2s linear infinite' }} />
            <p style={{ marginTop: '1rem' }}>Crafting your region-based plan...</p>
          </div>
        )}

        {dietPlan && !loadingDiet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Daily Calories</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{dietPlan.totalCalories} kcal</p>
              </div>
              <div style={{ background: 'var(--secondary)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Protein Goal</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{dietPlan.proteinSuggestion}</p>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', padding: '0.5rem', borderLeft: '4px solid var(--primary)', background: '#f8f8f8' }}>
              <strong>Regional Note:</strong> {dietPlan.regionalNote}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dietPlan.dietPlan.map((item: any, i: number) => (
                <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase' }}>{item.time}</p>
                  <p style={{ fontWeight: 600, margin: '0.2rem 0' }}>{item.meal}</p>
                  <p style={{ fontSize: '0.9rem', color: '#444' }}>{item.description}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Don't like something?</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="e.g. I don't like eggs" 
                  value={dislikedFood} 
                  onChange={e => setDislikedFood(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="secondary" onClick={generateDiet}>Replace</button>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
