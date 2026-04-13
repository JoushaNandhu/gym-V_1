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
  Crosshair,
  ScanSearch,
  Dna
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
      <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '90px', height: '90px', borderRadius: '2.5rem', background: 'var(--primary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 40px var(--primary-glow)', border: '2px solid rgba(255,255,255,0.2)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : ( <UserIcon color="white" size={40} /> )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1 style={{ fontSize: '3.2rem', marginBottom: 0 }} className="glitter-text">{profile.name}</h1>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1.2rem', borderRadius: '3rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Dna size={16} color="#a855f7" />
                 <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>VANGUARD ELITE TIER</span>
              </div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '0.5rem' }}>{profile.age} Years • {profile.state}, {profile.country}</p>
          </div>
        </div>
        <button className="secondary" style={{ borderRadius: '3rem', padding: '0.8rem 2rem' }} onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>
          De-authenticate
        </button>
      </header>

      {/* Quantum Analyzer Section */}
      <section style={{ marginBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '2.5rem' }}>
             <Microscope size={40} color="#a855f7" /> Quantum Analyzer <span style={{ opacity: 0.2, fontSize: '0.9rem' }}>Neural_A7</span>
          </h2>
          <span className="badge" style={{ animation: 'pulse 2s infinite' }}>SYNCING BIOSYSTEMS...</span>
        </div>

        <div className="analyzer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
          {[
            { id: 'Medical Report', icon: <Stethoscope size={40} />, label: 'Medical Archivist', color: '#818cf8', desc: 'Precise extraction (0.1% margin)' },
            { id: 'Blood Test', icon: <Droplets size={40} />, label: 'Blood Matrix', color: '#f43f5e', desc: 'Cellular decomposition logic' },
            { id: 'Medication', icon: <Pill size={40} />, label: 'Chemical Vault', color: '#2dd4bf', desc: 'RX synthetic identifier' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ y: -15, scale: 1.02 }}
              className="card" style={{ cursor: 'pointer', padding: '3.5rem 2.5rem', border: activeAnalyzer === tool.id ? '2px solid #a855f7' : '1px solid var(--border)' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', width: '80px', height: '80px', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tool.icon}
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{tool.label}</h3>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.6 }}>{tool.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Report View */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '5rem', overflow: 'hidden' }}>
            <div className="card" style={{ border: '2px solid #a855f7', background: 'rgba(168, 85, 247, 0.05)', padding: '4rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                  <h2 className="glitter-text" style={{ fontSize: '2.5rem' }}>{activeAnalyzer} Neural Core</h2>
                  <button onClick={() => setActiveAnalyzer(null)} className="secondary" style={{ padding: '0.6rem' }}><X size={32} /></button>
               </div>
               {!analysisResult && !isAnalyzing && (
                 <div className="upload-zone" style={{ borderStyle: 'solid', padding: '5rem' }} onClick={() => fileInputRef.current?.click()}>
                    <ScanSearch size={64} color="#a855f7" style={{ marginBottom: '2rem' }} />
                    <h3 style={{ fontSize: '1.5rem' }}>Inject Bio-Data Archives</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.75rem' }}>Drag or select documentation for high-fidelity scanning</p>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                 </div>
               )}
               {isAnalyzing && <div style={{ textAlign: 'center', padding: '8rem 0' }}><RefreshCw className="spinning" size={80} color="#a855f7" /><h3 style={{ marginTop: '3rem', fontSize: '1.5rem' }}>Decrypting Biological Ciphers...</h3></div>}
               {analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="card" style={{ background: 'rgba(0,0,0,0.6)', marginBottom: '3rem', padding: '2.5rem' }}>
                       <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{analysisResult.title}</h3>
                       <p style={{ fontSize: '1.2rem', lineHeight: 1.8, opacity: 0.8 }}>{analysisResult.summary}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                       {analysisResult.metrics?.map((m: any, i: number) => (
                         <div key={i} className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 900 }}>{m.label}</p>
                            <p style={{ fontSize: '2.5rem', fontWeight: 950, margin: '0.75rem 0' }}>{m.value} <span style={{ fontSize: '1.1rem', color: '#a855f7' }}>{m.unit}</span></p>
                            <span className="badge" style={{ background: m.status === 'Normal' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: m.status === 'Normal' ? '#22c55e' : '#ef4444' }}>{m.status}</span>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '2.5rem', marginBottom: '5rem' }}>
        <div className="card glass" style={{ padding: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}><Scale size={32} /> Physique Matrix</h2>
            <button className="secondary" style={{ padding: '0.6rem' }} onClick={() => setIsEditingBmi(!isEditingBmi)}><Edit2 size={20} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5rem' }}>
            <div style={{ width: '160px', height: '160px', borderRadius: '3.5rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px var(--primary-glow)', transform: 'rotate(-3deg)' }}>
               <span style={{ fontSize: '4.5rem', fontWeight: 950 }}>{bmi}</span>
            </div>
            <div>
               <p style={{ fontSize: '2.4rem', fontWeight: 950, color: '#a855f7' }}>{bmi && bmi < 18.5 ? "DIVERGENT" : bmi && bmi < 25 ? "OPTIMAL" : "CRITICAL"}</p>
               <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.75rem' }}>Neural mass reading calibrated.</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--primary)', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <p style={{ fontWeight: 950, opacity: 0.8, fontSize: '1rem', letterSpacing: '0.3em' }}>CORE ARCHIVE</p>
           <h2 style={{ fontSize: '3.5rem', margin: '1.5rem 0', fontWeight: 950 }}>{profile.goal}</h2>
           <div style={{ height: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
             <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} style={{ height: '100%', background: 'white' }} />
           </div>
        </div>
      </div>

      {/* Identify The Meal Agent */}
      <section className="card" style={{ padding: '5rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '5rem' }}>
          <span className="badge" style={{ marginBottom: '1.5rem' }}>AI AGENT_12 ENABLED</span>
          <h2 className="glitter-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>Identify The Meal</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '700px' }}>Multi-spectral molecular identifies every ingredient and vitamin across your nutritional intake.</p>
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '3.5rem' }}>
             <button className="primary" style={{ padding: '1.25rem 3rem', borderRadius: '4rem', fontSize: '1.2rem' }} onClick={() => foodInputRef.current?.click()}>
               <ScanSearch size={28} /> Launch Meal Scanner
             </button>
             <button className="secondary" style={{ padding: '1.25rem 3rem', borderRadius: '4rem', fontSize: '1.2rem' }} onClick={generateDiet} disabled={loadingDiet}>
               {loadingDiet ? <RefreshCw className="spinning" /> : <Utensils size={28} />} Sync Diet Matrix
             </button>
             <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*" />
          </div>
        </div>

        {/* Food Mapping Results */}
        <AnimatePresence>
          {isAnalyzingFood && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '8rem 0' }}>
               <BrainCircuit className="spinning" size={80} color="#a855f7" />
               <h3 style={{ marginTop: '3rem', fontSize: '1.8rem' }}>Reconstructing Mineral Arrays...</h3>
            </motion.div>
          )}

          {foodResult && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ border: '2px solid rgba(168, 85, 247, 0.5)', background: 'rgba(0,0,0,0.4)', padding: '4rem' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '5rem' }}>
                  <div>
                    <div style={{ borderRadius: '2rem', overflow: 'hidden', marginBottom: '3rem', border: '4px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
                       <img src={foodImagePreview || ''} alt="Analyzed meal" style={{ width: '100%', height: 'auto' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                       <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 900 }}>KCAL DENSITY</p>
                          <p style={{ fontSize: '2.2rem', fontWeight: 950 }}>{calculateTotal('calories')}</p>
                       </div>
                       <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                          <p style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: 900 }}>NITROGEN BASE</p>
                          <p style={{ fontSize: '2.2rem', fontWeight: 950 }}>{calculateTotal('protein')}g</p>
                       </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                      <h3 style={{ fontSize: '2.5rem' }}>{foodResult.dishName}</h3>
                      <button onClick={() => setFoodResult(null)} className="secondary" style={{ padding: '0.5rem' }}><X size={24} /></button>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '2rem' }}>
                       {foodResult.ingredients.map((ing: any, i: number) => (
                         <div key={i} className="card" style={{ background: 'rgba(255,255,255,0.03)', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                               <div>
                                  <h4 style={{ fontSize: '1.6rem', color: '#fff' }}>{ing.name}</h4>
                                  <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '0.5rem' }}>{ing.summary}</p>
                               </div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--secondary)', padding: '0.75rem 1.5rem', borderRadius: '1.5rem' }}>
                                  <button onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})}><Minus size={20} /></button>
                                  <span style={{ fontWeight: 950, fontSize: '1.2rem' }}>{servingSizes[i]}g</span>
                                  <button onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})}><Plus size={20} /></button>
                               </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                               {['calories', 'carbs', 'protein', 'fat'].map(n => (
                                 <div key={n} style={{ borderRight: n !== 'fat' ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 900 }}>{n.toUpperCase()}</p>
                                    <p style={{ fontWeight: 950, fontSize: '1.1rem' }}>{calculateNutrient(i, n as any)}{n === 'calories' ? '' : 'g'}</p>
                                 </div>
                               ))}
                            </div>

                            <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', display: 'grid', gap: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem' }}>
                               {Object.entries(ing.vitamins).map(([key, val]: any) => (
                                 <div key={key}>
                                    <p style={{ fontSize: '0.6rem', color: '#a855f7', fontWeight: 950 }}>{key.replace('vitamin', 'VIT ').toUpperCase()}</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{val}</p>
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

        {/* Standard Matrix Results */}
        {dietPlan && !foodResult && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', marginTop: '4rem' }}>
              {dietPlan.dietPlan.map((item: any, i: number) => (
                 <motion.div key={i} whileHover={{ scale: 1.02 }} className="card" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.01)', padding: '3rem' }}>
                    <span className="badge" style={{ marginBottom: '2rem' }}>{item.time} PHASE</span>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{item.meal}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>{item.description}</p>
                 </motion.div>
              ))}
           </div>
        )}
      </section>
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
