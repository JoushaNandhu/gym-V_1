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
  Dna,
  Save,
  Trash2
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

  // Agent 1: Food Analyst State
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<any>(null);
  const [foodImagePreview, setFoodImagePreview] = useState<string | null>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [servingSizes, setServingSizes] = useState<any>({});

  // Agent 2: Diet Planner State
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);

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
    setFoodResult(null); // Switch to Diet context
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
    setDietPlan(null); // Switch to Analysis context
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

  const updateDietItem = (index: number, field: 'meal' | 'description', value: string) => {
    const newPlan = { ...dietPlan };
    newPlan.dietPlan[index][field] = value;
    setDietPlan(newPlan);
  };

  if (!profile) return <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}><RefreshCw className="spinning" /></div>;

  return (
    <div className="container">
      <header style={{ marginBottom: '5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '80px', height: '80px', borderRadius: '2rem', background: 'var(--primary)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 30px rgba(37, 99, 235, 0.2)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : ( <UserIcon color="white" size={32} /> )}
          </div>
          <div>
            <h1 style={{ fontSize: '2.8rem', color: '#1e293b' }}>{profile.name}</h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span className="badge" style={{ backgroundColor: '#0ea5e920', color: '#0369a1', borderColor: 'transparent' }}>PRO BIOMETRIC STATUS</span>
              <span className="badge" style={{ backgroundColor: '#f9731620', color: '#c2410c', borderColor: 'transparent' }}>{profile.goal}</span>
            </div>
          </div>
        </div>
        <button className="secondary" style={{ borderRadius: '3rem' }} onClick={() => { localStorage.removeItem("user_session"); router.push("/login"); }}>
          Secure Exit
        </button>
      </header>

      {/* Analyzer Categories */}
      <section style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Microscope size={32} color="var(--primary-solid)" /> Bio-Metric Signal Analyzer
        </h2>
        <div className="analyzer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
           {[
            { id: 'Medical Report', icon: <Stethoscope size={32} />, label: 'Neural Archivist', color: '#0ea5e9' },
            { id: 'Blood Test', icon: <Droplets size={32} />, label: 'Blood Matrix', color: '#f43f5e' },
            { id: 'Medication', icon: <Pill size={32} />, label: 'Chemical Ledger', color: '#10b981' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ y: -8 }}
              className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '3.5rem 2.5rem' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: `${tool.color}10`, padding: '1.5rem', borderRadius: '1.5rem' }}>{tool.icon}</div>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{tool.label}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.75rem' }}>Extract medical signals via Vision AI</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Report View */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ marginBottom: '5rem' }}>
            <div className="card" style={{ border: '2px solid var(--primary-solid)', background: '#fff' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                  <h2 className="glitter-text" style={{ fontSize: '2.5rem' }}>{activeAnalyzer} Neural Eye</h2>
                  <button onClick={() => setActiveAnalyzer(null)} className="secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><X size={24} /></button>
               </div>
               {!analysisResult && !isAnalyzing && (
                 <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <ScanSearch size={48} color="var(--primary-solid)" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#0f172a' }}>Inject Medical Assets</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Vision AI will decompile the documentation</p>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                 </div>
               )}
               {isAnalyzing && <div style={{ textAlign: 'center', padding: '6rem 0' }}><RefreshCw className="spinning" size={64} color="var(--primary-solid)" /><h3 style={{ marginTop: '2rem' }}>Extracting Biological Constants...</h3></div>}
               {analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="card" style={{ background: '#f8fafc', marginBottom: '2rem', padding: '2rem' }}>
                       <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{analysisResult.title}</h3>
                       <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#475569' }}>{analysisResult.summary}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                       {analysisResult.metrics?.map((m: any, i: number) => (
                         <div key={i} className="card" style={{ padding: '2rem' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 900 }}>{m.label}</p>
                            <p style={{ fontSize: '2rem', fontWeight: 950, margin: '0.5rem 0' }}>{m.value} <span style={{ fontSize: '0.9rem', color: 'var(--primary-solid)' }}>{m.unit}</span></p>
                            <span className="badge" style={{ background: m.status === 'Normal' ? '#ecfdf5' : '#fef2f2', color: m.status === 'Normal' ? '#059669' : '#dc2626', border: 'none' }}>{m.status}</span>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '6rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
           <div style={{ width: '120px', height: '120px', background: 'var(--primary)', borderRadius: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 950 }}>
              {bmi}
           </div>
           <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.4rem' }}>Biometric Index</h3>
                <button className="secondary" style={{ padding: '0.5rem', borderRadius: '50%' }} onClick={() => setIsEditingBmi(!isEditingBmi)}><Edit2 size={16} /></button>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-solid)', marginTop: '0.5rem' }}>
                {bmi && bmi < 18.5 ? "DIVERGENT" : bmi && bmi < 25 ? "OPTIMAL" : "CRITICAL"}
              </p>
           </div>
        </div>
        <div className="card" style={{ background: 'var(--foreground)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <p style={{ opacity: 0.6, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em' }}>CORE OBJECTIVE</p>
           <h2 style={{ fontSize: '3rem', margin: '0.75rem 0', fontWeight: 950 }}>{profile.goal}</h2>
           <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden', marginTop: '1.5rem' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} style={{ height: '100%', background: 'white' }} />
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Agent 1: Spectral Food Analyst */}
        <section className="card">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge" style={{ marginBottom: '1rem' }}>AGENT AI_IDENTIFY</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950 }}>Spectral Analyst</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Spectral identification of molecular nutrients</p>
          </div>

          {!foodResult && !isAnalyzingFood && (
            <div className="upload-zone" onClick={() => foodInputRef.current?.click()}>
              <Camera size={48} color="var(--primary-solid)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: '#0f172a' }}>Capture/Scan Meal</h3>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Decompile nutrients from visual data</p>
              <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*" />
            </div>
          )}

          {isAnalyzingFood && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
               <BrainCircuit className="spinning" size={64} color="var(--primary-solid)" />
               <h3 style={{ marginTop: '2.5rem' }}>Mapping Macro Lattice...</h3>
            </div>
          )}

          {foodResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div style={{ borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <img src={foodImagePreview || ''} alt="Analyzed" style={{ width: '100%', height: 'auto' }} />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>ENERGY_MASS</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>{calculateTotal('calories')} kcal</p>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #0ea5e950' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--primary-solid)' }}>PROTEIN_CORE</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>{calculateTotal('protein')}g</p>
                  </div>
               </div>
               <div style={{ display: 'grid', gap: '1rem' }}>
                  {foodResult.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="card" style={{ padding: '2rem', background: '#fff' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '1.25rem' }}>{ing.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                             <button onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})} style={{ background: 'white', padding: '0.2rem', borderRadius: '50%', height: '32px', width: '32px' }}><Minus size={14} /></button>
                             <span style={{ fontWeight: 900 }}>{servingSizes[i]}g</span>
                             <button onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})} style={{ background: 'white', padding: '0.2rem', borderRadius: '50%', height: '32px', width: '32px' }}><Plus size={14} /></button>
                          </div>
                       </div>
                       <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                         {Object.entries(ing.vitamins).slice(0, 4).map(([k, v]: any) => (
                           <div key={k}><p style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{k.toUpperCase()}</p><p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v}</p></div>
                         ))}
                       </div>
                    </div>
                  ))}
               </div>
               <button className="secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setFoodResult(null)}><RefreshCw size={16} /> New Scan</button>
            </motion.div>
          )}
        </section>

        {/* Agent 2: Bio-Kinetic Diet Architect */}
        <section className="card">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge" style={{ marginBottom: '1rem' }}>AGENT AI_GENERATE</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950 }}>Kinetic Architect</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Synthetic diet generation based on goal</p>
          </div>

          {!dietPlan && !loadingDiet && (
            <div style={{ padding: '6rem 0', textAlign: 'center' }}>
               <Zap size={64} color="#f97316" style={{ margin: '0 auto 2rem' }} />
               <button className="primary" style={{ margin: '0 auto' }} onClick={generateDiet}>Synchronize Diet Matrix</button>
            </div>
          )}

          {loadingDiet && (
            <div style={{ textAlign: 'center', padding: '10rem 0' }}>
               <RefreshCw className="spinning" size={64} color="#f97316" />
               <h3 style={{ marginTop: '2rem' }}>Simulating Nutrient Pathways...</h3>
            </div>
          )}

          {dietPlan && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {dietPlan.dietPlan.map((item: any, i: number) => (
                    <div key={i} className="card" style={{ padding: '2.5rem', border: editingMealIndex === i ? '2px solid #f97316' : '1px solid #e2e8f0' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <span className="badge" style={{ background: '#f9731610', color: '#ea580c' }}>{item.time} PHASE</span>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingMealIndex(editingMealIndex === i ? null : i)}>
                               {editingMealIndex === i ? <Save size={16} /> : <Edit2 size={16} />}
                            </button>
                          </div>
                       </div>
                       {editingMealIndex === i ? (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input value={item.meal} onChange={e => updateDietItem(i, 'meal', e.target.value)} />
                            <textarea value={item.description} style={{ height: '100px' }} onChange={e => updateDietItem(i, 'description', e.target.value)} />
                         </div>
                       ) : (
                         <>
                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{item.meal}</h3>
                            <p style={{ color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>{item.description}</p>
                         </>
                       )}
                    </div>
                  ))}
               </div>
               <button className="secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={generateDiet}><RefreshCw size={16} /> Re-Calculate Axis</button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
