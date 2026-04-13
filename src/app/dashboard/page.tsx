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
  CheckCircle2,
  Camera,
  User as UserIcon,
  Plus,
  Minus,
  Sparkles,
  Zap,
  LayoutDashboard
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

  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<any>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [servingSizes, setServingSizes] = useState<any>({});

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
    if (unit === "feet") heightInMeters = heightInMeters * 0.3048;
    else heightInMeters = heightInMeters / 100;
    const val = parseFloat(weight) / (heightInMeters * heightInMeters);
    setBmi(Math.round(val * 10) / 10);
  };

  const handleUpdateBmi = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("user_profile", JSON.stringify(profile));
    calculateBmi(profile.weight, profile.height, profile.heightUnit);
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
    } catch (e) { console.error(e); } finally { setLoadingDiet(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({ image: base64String, type: activeAnalyzer })
        });
        setAnalysisResult(await res.json());
      } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingFood(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const res = await fetch("/api/analyze-food", {
          method: "POST",
          body: JSON.stringify({ image: base64String })
        });
        const data = await res.json();
        setFoodResult(data);
        const initialSizes: any = {};
        data.ingredients.forEach((ing: any, i: number) => { initialSizes[i] = ing.baseQuantity; });
        setServingSizes(initialSizes);
      } catch (err) { console.error(err); } finally { setIsAnalyzingFood(false); }
    };
    reader.readAsDataURL(file);
  };

  const calculateNutrient = (index: number, type: 'protein' | 'carbs' | 'fat') => {
    const ing = foodResult.ingredients[index];
    const qty = servingSizes[index] || 0;
    return Math.round(((ing[type] / ing.baseQuantity) * qty) * 10) / 10;
  };

  const calculateTotal = (type: 'protein' | 'carbs' | 'fat') => {
    if (!foodResult) return 0;
    return foodResult.ingredients.reduce((total: number, _: any, i: number) => total + calculateNutrient(i, type), 0).toFixed(1);
  };

  if (!profile) return <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}><RefreshCw className="spinning" /></div>;

  return (
    <div className="container">
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '72px', height: '72px', borderRadius: '1.5rem', background: 'var(--primary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserIcon color="white" size={32} />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem' }} className="glitter-text">{profile.name}</h1>
            <p style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutDashboard size={14} /> Neural Dashboard Enabled</p>
          </div>
        </div>
        <button className="secondary" onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>
          Sign Out
        </button>
      </header>

      {/* Analyzer Tools */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <Zap size={24} color="#a855f7" /> Quantum Analyzer
          </h2>
          <span className="badge">AI Vision V2.4</span>
        </div>

        <div className="analyzer-grid">
          {[
            { id: 'Medical Report', icon: <Stethoscope size={30} />, label: 'Medical Scan', color: '#818cf8' },
            { id: 'Blood Test', icon: <Droplets size={30} />, label: 'Blood Matrix', color: '#f43f5e' },
            { id: 'Medication', icon: <Pill size={30} />, label: 'RX Identifier', color: '#2dd4bf' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ y: -8, scale: 1.02 }}
              className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                {tool.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>{tool.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Full AI Scan Ready</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Analysis Modals */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button onClick={() => setActiveAnalyzer(null)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent' }}><X size={24} /></button>
              
              <h2 className="glitter-text" style={{ marginBottom: '1rem' }}>{activeAnalyzer} Analysis</h2>
              
              {!analysisResult && !isAnalyzing && (
                <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                   <Upload size={48} color="#a855f7" style={{ marginBottom: '1.5rem' }} />
                   <h3>Feed Data to AI</h3>
                   <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                </div>
              )}
              {isAnalyzing && <div style={{ textAlign: 'center', padding: '4rem' }}><RefreshCw className="spinning" size={48} color="#a855f7" /><p style={{ marginTop: '2rem', fontWeight: 700 }}>Processing Scientific Data...</p></div>}
              {analysisResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <div style={{ padding: '1.5rem', background: 'var(--secondary)', borderRadius: '1rem', borderLeft: '4px solid #a855f7', marginBottom: '2rem' }}>
                      <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{analysisResult.title}</p>
                      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>{analysisResult.summary}</p>
                   </div>
                   <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    {analysisResult.metrics?.map((m: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                        <div><p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{m.label}</p><p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{m.value} {m.unit}</p></div>
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 900, background: m.status === 'Normal' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: m.status === 'Normal' ? '#10b981' : '#ef4444' }}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {/* BMI Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <div style={{ background: 'var(--primary)', height: '100px', width: '100px', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px var(--primary-glow)' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{bmi}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: '1.1rem' }}>Body Mass Index</h3>
               <button className="secondary" style={{ padding: '0.4rem' }} onClick={() => setIsEditingBmi(!isEditingBmi)}><Edit2 size={14} /></button>
            </div>
            <p style={{ color: '#a855f7', fontWeight: 800, fontSize: '1.2rem', marginTop: '0.25rem' }}>{bmi && bmi < 18.5 ? "Underweight" : bmi && bmi < 25 ? "Optimal Level" : "Overweight Risk"}</p>
          </div>
        </div>

        {/* Goal Card */}
        <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 800, opacity: 0.8 }}>EVOLUTION ARCH</p>
            <Sparkles size={20} />
          </div>
          <h2 style={{ fontSize: '2.2rem', margin: '0.75rem 0' }}>{profile.goal}</h2>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} style={{ height: '100%', background: 'white' }} />
          </div>
        </div>
      </div>

      {/* Diet Plan Section */}
      <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="glitter-text" style={{ fontSize: '2.5rem' }}>Neural Nutrition</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Syncing with {profile.state} food supply chain</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="secondary" onClick={() => foodInputRef.current?.click()}><Camera size={20} /> Scan Plates</button>
            <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*" />
            <button className="primary" onClick={generateDiet} disabled={loadingDiet}>
               {loadingDiet ? <RefreshCw className="spinning" /> : <Plus size={20} />} Plan Generation
            </button>
          </div>
        </div>

        {foodResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ border: '1px solid #a855f7' }}>
             <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>🍱 {foodResult.dishName}</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ textAlign: 'center', background: 'var(--secondary)', padding: '1.5rem', borderRadius: '1.5rem' }}>
                   <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>PROTEIN</p>
                   <p style={{ fontSize: '2rem', fontWeight: 900 }}>{calculateTotal('protein')}g</p>
                </div>
                {/* Carbs/Fat similarly... */}
             </div>
             <div style={{ display: 'grid', gap: '1rem' }}>
                {foodResult.ingredients.map((ing: any, i: number) => (
                   <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                      <p style={{ fontWeight: 800 }}>{ing.name}</p>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                           <button onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})}><Minus size={16} /></button>
                           <span style={{ fontWeight: 900 }}>{servingSizes[i]}g</span>
                           <button onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})}><Plus size={16} /></button>
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}

        {dietPlan && !foodResult && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
             {dietPlan.dietPlan.map((item: any, i: number) => (
                <motion.div key={i} className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem' }}>
                   <span className="badge" style={{ marginBottom: '1rem' }}>{item.time}</span>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.meal}</h3>
                   <p style={{ color: 'var(--muted)' }}>{item.description}</p>
                </motion.div>
             ))}
          </div>
        )}
      </section>
    </div>
  );
}
