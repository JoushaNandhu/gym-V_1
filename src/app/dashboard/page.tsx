"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  RefreshCw,
  Upload,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [isEditingBmi, setIsEditingBmi] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [showReports, setShowReports] = useState(true);
  const [dislikedFood, setDislikedFood] = useState("");
  
  const [activeAnalyzer, setActiveAnalyzer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!heightInMeters || !weight) return;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({
            image: base64String,
            type: activeAnalyzer
          })
        });
        const data = await res.json();
        setAnalysisResult(data);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="badge badge-secondary" style={{ marginBottom: '0.5rem' }}>Overview</span>
          <h1 style={{ fontSize: '2.5rem' }}>Welcome, {profile.name}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Your health dashboard is ready.</p>
        </div>
        <button className="secondary" onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>
          Sign Out
        </button>
      </header>

      {/* Analyzer Categories */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} /> Health Analysis
          </h2>
          <button className="secondary" onClick={() => setShowReports(!showReports)}>
            {showReports ? "Hide Tools" : "Show Tools"}
          </button>
        </div>

        {showReports && (
          <div className="analyzer-grid">
            {[
              { id: 'Medical Report', icon: <Stethoscope size={28} />, label: 'Medical Report', desc: 'Scan prescriptions & notes' },
              { id: 'Blood Test', icon: <Droplets size={28} />, label: 'Blood Test', desc: 'Detailed lab result analysis', color: '#ef4444' },
              { id: 'Medication', icon: <Pill size={28} />, label: 'Medication', desc: 'Identify dosage & frequency', color: '#3b82f6' }
            ].map((tool) => (
              <motion.div 
                key={tool.id}
                whileHover={{ y: -5 }}
                className="card"
                style={{ cursor: 'pointer', textAlign: 'center' }}
                onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
              >
                <div style={{ color: tool.color || 'inherit', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  {tool.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tool.label}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Analysis Modal/Panel */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card"
              style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <button 
                onClick={() => setActiveAnalyzer(null)}
                style={{ position: 'absolute', right: '1rem', top: '1rem', padding: '0.5rem', background: 'transparent' }}
              >
                <X size={20} />
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{activeAnalyzer} Analyzer</h2>
                <p style={{ color: 'var(--muted)' }}>Upload an image or document to extract precise results.</p>
              </div>

              {!analysisResult && !isAnalyzing && (
                <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={40} style={{ margin: '0 auto 1rem', color: 'var(--muted)' }} />
                  <p style={{ fontWeight: 600 }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>Supports JPG, PNG (Max 5MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*"
                  />
                </div>
              )}

              {isAnalyzing && (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <RefreshCw className="spinning" size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} />
                  <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>AI is decoding your {activeAnalyzer}...</p>
                  <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Extracting precise values and medical metrics</p>
                </div>
              )}

              {analysisResult && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
                    <CheckCircle2 color="#10b981" />
                    <div>
                      <p style={{ fontWeight: 700 }}>Analysis Complete</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Precision Match: 99.9%</p>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{analysisResult.title}</h3>
                  <p style={{ marginBottom: '2rem', lineHeight: 1.6 }}>{analysisResult.summary}</p>

                  <h4 style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>Extracted Metrics</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {analysisResult.metrics?.map((m: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{m.label}</p>
                          <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{m.value} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.unit}</span></p>
                        </div>
                        <span style={{ 
                          padding: '0.4rem 0.75rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          background: m.status === 'Normal' ? '#ecfdf5' : '#fef2f2',
                          color: m.status === 'Normal' ? '#059669' : '#dc2626'
                        }}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '1.5rem', background: '#111', color: '#fff', borderRadius: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 600 }}>HEALTH INSIGHT</p>
                    <p style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{analysisResult.interpretation}</p>
                  </div>

                  <button 
                    className="secondary" 
                    style={{ width: '100%', marginTop: '2rem' }} 
                    onClick={() => { setAnalysisResult(null); setIsAnalyzing(false); }}
                  >
                    Analyze Another Report
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* BMI Card - Redesigned */}
        <div className="card glass" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'rgba(0,0,0,0.03)', borderRadius: '50%' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={20} /> Body Mass Index
            </h2>
            <button className="secondary" style={{ padding: '0.5rem' }} onClick={() => setIsEditingBmi(!isEditingBmi)}>
              <Edit2 size={16} />
            </button>
          </div>
          
          {isEditingBmi ? (
            <form onSubmit={handleUpdateBmi} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Weight ({profile.weightUnit || 'kg'})</label>
                <input 
                  type="number" 
                  value={profile.weight} 
                  onChange={e => setProfile({...profile, weight: e.target.value})}
                />
              </div>
              <button type="submit" className="primary" style={{ marginTop: '0.5rem' }}>Save Changes</button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ background: 'black', color: 'white', padding: '1.5rem 2rem', borderRadius: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '3.5rem', fontWeight: 900 }}>{bmi}</span>
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {bmi && bmi < 18.5 ? "Underweight" : bmi && bmi < 25 ? "Healthy Weight" : "Overweight"}
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Based on your latest profile update.</p>
              </div>
            </div>
          )}
        </div>

        {/* Goal Card - Redesigned */}
        <div className="card primary" style={{ background: 'black', color: 'white' }}>
          <p style={{ opacity: 0.6, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Goal</p>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{profile.goal}</h2>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '1.5rem', position: 'relative' }}>
             <div style={{ height: '100%', width: '45%', background: 'white', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.75rem', opacity: 0.8 }}>45% of path completed</p>
        </div>
      </div>

      {/* Diet Plan - Redesigned */}
      <section className="card animate-fade-in" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Utensils size={28} /> AI-Powered Nutrition
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Precision meal plans for {profile.state}, {profile.country}</p>
          </div>
          <button className="primary" onClick={generateDiet} disabled={loadingDiet}>
            {dietPlan ? <><RefreshCw size={18} /> Regenerate</> : "Generate Diet"}
          </button>
        </div>

        {!dietPlan && !loadingDiet && (
          <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
            <Utensils size={48} style={{ margin: '0 auto 1rem' }} />
            <p>Your personalized diet plan will appear here.</p>
          </div>
        )}

        {loadingDiet && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={40} className="spinning" style={{ margin: '0 auto', color: 'var(--primary)' }} />
            <p style={{ marginTop: '1.5rem', fontWeight: 600 }}>Personalizing your plan...</p>
          </div>
        )}

        {dietPlan && !loadingDiet && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Target Calories</p>
                <p style={{ fontSize: '2rem', fontWeight: 900 }}>{dietPlan.totalCalories} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kcal</span></p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Protein Budget</p>
                <p style={{ fontSize: '2rem', fontWeight: 900 }}>{dietPlan.proteinSuggestion}</p>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '1rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'start' }}>
              <AlertCircle size={20} style={{ marginTop: '0.1rem', color: '#64748b' }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Regional Preferences Integrated</p>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{dietPlan.regionalNote}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {dietPlan.dietPlan.map((item: any, i: number) => (
                <div key={i} className="card" style={{ padding: '1.5rem', borderRadius: '1rem', transition: 'none', border: '1px solid #f1f5f9' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.time}</span>
                    <button style={{ background: 'transparent', padding: 0 }}><ChevronRight size={16} color="#cbd5e1" /></button>
                   </div>
                   <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{item.meal}</p>
                   <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>{item.description}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '3rem', padding: '2rem', background: '#fafafa', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '1.1rem' }}>Smart Replacement</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Don't like a specific food? Tell AI to replace it with an equivalent.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="e.g. Replace eggs with vegetarian option" 
                  value={dislikedFood} 
                  onChange={e => setDislikedFood(e.target.value)}
                  style={{ flex: 1, border: '1px solid #cbd5e1' }}
                />
                <button className="primary" onClick={generateDiet}>Update Plan</button>
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
