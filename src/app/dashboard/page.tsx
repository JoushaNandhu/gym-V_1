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
  LayoutDashboard,
  BrainCircuit,
  Microscope,
  Crosshair
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
  const [foodImagePreview, setFoodImagePreview] = useState<string | null>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [servingSizes, setServingSizes] = useState<any>({});

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

  const generateDiet = async () => {
    setLoadingDiet(true);
    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        body: JSON.stringify({ goal: profile.goal, country: profile.country, state: profile.state, forbiddenFood: dislikedFood })
      });
      setDietPlan(await res.json());
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
        const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ image: base64String, type: activeAnalyzer }) });
        setAnalysisResult(await res.json());
      } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzingFood(true);
    setFoodResult(null);
    setFoodImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const res = await fetch("/api/analyze-food", { method: "POST", body: JSON.stringify({ image: base64String }) });
        const data = await res.json();
        setFoodResult(data);
        const initialSizes: any = {};
        data.ingredients.forEach((ing: any, i: number) => { initialSizes[i] = ing.baseQuantity; });
        setServingSizes(initialSizes);
      } catch (err) { console.error(err); } finally { setIsAnalyzingFood(false); }
    };
    reader.readAsDataURL(file);
  };

  const calculateNutrient = (index: number, type: 'protein' | 'carbs' | 'fat' | 'calories') => {
    const ing = foodResult.ingredients[index];
    const qty = servingSizes[index] || 0;
    const val = (ing[type] / ing.baseQuantity) * qty;
    return Math.round(val * 10) / 10;
  };

  const calculateTotal = (type: 'protein' | 'carbs' | 'fat' | 'calories') => {
    if (!foodResult) return 0;
    return foodResult.ingredients.reduce((total: number, _: any, i: number) => total + calculateNutrient(i, type), 0).toFixed(1);
  };

  if (!profile) return <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}><RefreshCw className="spinning" /></div>;

  return (
    <div className="container">
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '80px', height: '80px', borderRadius: '2rem', background: 'var(--primary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 30px var(--primary-glow)', border: '2px solid rgba(255,255,255,0.1)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : ( <UserIcon color="white" size={32} /> )}
          </div>
          <div>
            <h1 style={{ fontSize: '2.8rem' }} className="glitter-text">Lvl. {profile.age} {profile.name}</h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span className="badge">Active AI Mesh</span>
              <span className="badge" style={{ borderColor: '#a855f7', color: '#a855f7' }}>{profile.goal}</span>
            </div>
          </div>
        </div>
        <button className="secondary" style={{ borderRadius: '3rem' }} onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>
          De-authenticate
        </button>
      </header>

      {/* Quantum Analyzer Section */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2.2rem' }}>
             <Microscope size={32} color="#a855f7" /> Quantum Analyzer <span style={{ opacity: 0.3, fontSize: '0.8rem' }}>Agent_7</span>
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--muted)' }}>SYSTEMS NOMINAL</span>
          </div>
        </div>

        <div className="analyzer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            { id: 'Medical Report', icon: <Stethoscope size={36} />, label: 'Biological Dossier', desc: 'Scan medical archives with 0.1precision' },
            { id: 'Blood Test', icon: <Droplets size={36} />, label: 'Hematology Matrix', desc: 'Deep blood profile decomposition' },
            { id: 'Medication', icon: <Pill size={36} />, label: 'Chemical Ledger', desc: 'Synthetic RX identifier agent' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ y: -12, scale: 1.02 }}
              className="card" style={{ cursor: 'pointer', padding: '3rem 2rem', border: activeAnalyzer === tool.id ? '2px solid #a855f7' : '1px solid var(--border)' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: '#white', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', width: '70px', height: '70px', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tool.icon}
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{tool.label}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>{tool.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Report View (No Refresh) */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '4rem', overflow: 'hidden' }}
          >
            <div className="card" style={{ border: '2px solid #a855f7', background: 'rgba(168, 85, 247, 0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                  <h2 className="glitter-text">{activeAnalyzer} Agent Console</h2>
                  <button onClick={() => setActiveAnalyzer(null)} className="secondary" style={{ padding: '0.5rem' }}><X size={24} /></button>
               </div>
               
               {!analysisResult && !isAnalyzing && (
                 <div className="upload-zone" style={{ borderStyle: 'solid', borderWidth: '1px' }} onClick={() => fileInputRef.current?.click()}>
                    <BrainCircuit size={48} color="#a855f7" style={{ marginBottom: '1.5rem' }} />
                    <h3>Awaiting Data Input</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Inject documentation for high-precision neural analysis</p>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                 </div>
               )}

               {isAnalyzing && (
                 <div style={{ textAlign: 'center', padding: '6rem 0' }}>
                   <RefreshCw className="spinning" size={64} color="#a855f7" />
                   <h3 style={{ marginTop: '2rem' }}>Decompiling Molecular Data...</h3>
                 </div>
               )}

               {analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="card" style={{ background: 'rgba(0,0,0,0.5)', marginBottom: '2rem' }}>
                       <h3 style={{ marginBottom: '1rem' }}>{analysisResult.title}</h3>
                       <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{analysisResult.summary}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                       {analysisResult.metrics?.map((m: any, i: number) => (
                         <div key={i} className="card" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 900 }}>{m.label}</p>
                            <p style={{ fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0' }}>{m.value} <span style={{ fontSize: '0.9rem', color: '#a855f7' }}>{m.unit}</span></p>
                            <span className="badge" style={{ background: m.status === 'Normal' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: m.status === 'Normal' ? '#22c55e' : '#ef4444', border: 'none' }}>{m.status}</span>
                         </div>
                       ))}
                    </div>
                    <div className="card" style={{ marginTop: '2rem', background: '#000' }}>
                       <h4 style={{ color: '#a855f7', marginBottom: '1rem' }}>NEURAL INTERPRETATION</h4>
                       <p style={{ fontSize: '1rem', opacity: 0.9 }}>{analysisResult.interpretation}</p>
                    </div>
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Physique Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card glass" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Scale size={24} /> Physic Matrix</h2>
            <button className="secondary" style={{ padding: '0.5rem' }} onClick={() => setIsEditingBmi(!isEditingBmi)}><Edit2 size={16} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
            <div style={{ width: '140px', height: '140px', borderRadius: '3rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px var(--primary-glow)', transform: 'rotate(-5deg)' }}>
               <span style={{ fontSize: '3.5rem', fontWeight: 950 }}>{bmi}</span>
            </div>
            <div>
               <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a855f7' }}>{bmi && bmi < 18.5 ? "Underweight" : bmi && bmi < 25 ? "Optimal" : "Overweight"}</p>
               <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Mass reading verified at {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--primary)', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
           <LayoutDashboard size={200} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
           <p style={{ fontWeight: 900, opacity: 0.8, fontSize: '0.9rem', letterSpacing: '0.2em' }}>MISSION PARAMETER</p>
           <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>{profile.goal}</h2>
           <div style={{ height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', overflow: 'hidden', marginTop: '2rem' }}>
             <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} style={{ height: '100%', background: 'white' }} />
           </div>
           <p style={{ marginTop: '1rem', fontWeight: 800 }}>70% Efficiency Reached</p>
        </div>
      </div>

      {/* Neural Nutrition Section */}
      <section className="card" style={{ padding: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
            <h2 className="glitter-text" style={{ fontSize: '3rem' }}>Neural Nutrition</h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Multi-agent food analysis and supply recommendation</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
             <button className="secondary" style={{ padding: '1rem 2rem' }} onClick={() => foodInputRef.current?.click()}><Camera size={20} /> Eye Scanner</button>
             <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*" />
             <button className="primary" onClick={generateDiet} disabled={loadingDiet}>
                {loadingDiet ? <RefreshCw className="spinning" /> : <Plus size={20} />} Synthetic Meal Plan
             </button>
          </div>
        </div>

        {/* Food Scanner Result */}
        <AnimatePresence>
          {isAnalyzingFood && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem 0' }}>
               <BrainCircuit className="spinning" size={64} color="#a855f7" />
               <h3 style={{ marginTop: '2rem' }}>Simulating Molecular Composition...</h3>
            </motion.div>
          )}

          {foodResult && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ border: '2px solid #a855f7', background: 'rgba(0,0,0,0.3)' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                  {/* Left: Image & Totals */}
                  <div>
                    <div style={{ borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                      <img src={foodImagePreview || ''} alt="Uploaded food" style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                       <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                          <p style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>KCAL</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{calculateTotal('calories')}</p>
                       </div>
                       <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                          <p style={{ color: '#a855f7', fontSize: '0.7rem' }}>PROTEIN</p>
                          <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{calculateTotal('protein')}g</p>
                       </div>
                    </div>
                  </div>

                  {/* Right: Detailed Breakdown */}
                  <div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>🍱 {foodResult.dishName}</h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                       {foodResult.ingredients.map((ing: any, i: number) => (
                         <div key={i} className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                               <div>
                                  <h4 style={{ fontSize: '1.3rem' }}>{ing.name}</h4>
                                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{ing.summary}</p>
                               </div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '1rem' }}>
                                  <button onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})}><Minus size={16} /></button>
                                  <span style={{ fontWeight: 900 }}>{servingSizes[i]}g</span>
                                  <button onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})}><Plus size={16} /></button>
                               </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                               <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>ENERGY</p>
                                  <p style={{ fontWeight: 800 }}>{calculateNutrient(i, 'calories')}kcal</p>
                               </div>
                               <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>CARBS</p>
                                  <p style={{ fontWeight: 800 }}>{calculateNutrient(i, 'carbs')}g</p>
                               </div>
                               <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>PROTEIN</p>
                                  <p style={{ fontWeight: 800 }}>{calculateNutrient(i, 'protein')}g</p>
                               </div>
                               <div>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>FAT</p>
                                  <p style={{ fontWeight: 800 }}>{calculateNutrient(i, 'fat')}g</p>
                               </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                               {Object.entries(ing.vitamins).map(([key, val]: any) => (
                                 <div key={key}>
                                    <p style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 900 }}>{key.replace('vitamin', 'Vit ').toUpperCase()}</p>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{val}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static Diet Plan Results */}
        {dietPlan && !foodResult && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
              {dietPlan.dietPlan.map((item: any, i: number) => (
                 <div key={i} className="card" style={{ border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}><Crosshair size={16} opacity={0.3} /></div>
                    <span className="badge" style={{ marginBottom: '1.5rem' }}>{item.time}</span>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{item.meal}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.description}</p>
                 </div>
              ))}
           </div>
        )}
      </section>
    </div>
  );
}
