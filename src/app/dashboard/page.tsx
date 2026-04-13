"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Utensils, 
  Scale, 
  Edit2, 
  Stethoscope, 
  Droplets, 
  Pill, 
  RefreshCw, 
  Upload, 
  X, 
  Camera, 
  User as UserIcon, 
  Plus, 
  Minus, 
  Sparkles, 
  Zap, 
  BrainCircuit, 
  Microscope, 
  ScanSearch, 
  Dna, 
  Save 
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [isEditingBmi, setIsEditingBmi] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  
  const [activeAnalyzer, setActiveAnalyzer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<any>(null);
  const [foodImagePreview, setFoodImagePreview] = useState<string | null>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [servingSizes, setServingSizes] = useState<any>({});
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
    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        body: JSON.stringify({ goal: profile.goal, country: profile.country, state: profile.state })
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
    return Math.round(((ing[type] / ing.baseQuantity) * qty) * 10) / 10;
  };

  const calculateTotal = (type: 'protein' | 'carbs' | 'fat' | 'calories') => {
    if (!foodResult) return 0;
    return foodResult.ingredients.reduce((total: number, _: any, i: number) => total + calculateNutrient(i, type), 0).toFixed(1);
  };

  if (!profile) return null;

  return (
    <div className="container">
      <header style={{ marginBottom: '6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '100px', height: '100px', borderRadius: '3rem', background: 'var(--primary)', position: 'relative', overflow: 'hidden', border: '5px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : ( <UserIcon color="white" size={40} style={{ margin: 'auto' }} /> )}
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

      {/* Analyzer Categories */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
           <h2 style={{ fontSize: '2.5rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Zap size={40} color="#3b82f6" fill="#3b82f6" /> Bio-Metric Systems
           </h2>
           <div style={{ display: 'flex', gap: '0.5rem' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} /> <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>AI AGENTS ONLINE</span></div>
        </div>
        
        <div className="analyzer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
           {[
            { id: 'Medical Report', icon: <Stethoscope size={36} />, label: 'Neural Archivist', color: '#3b82f6' },
            { id: 'Blood Test', icon: <Droplets size={36} />, label: 'Hematology Matrix', color: '#ef4444' },
            { id: 'Medication', icon: <Pill size={36} />, label: 'Molecular Vault', color: '#10b981' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ y: -10 }}
              className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '4rem 2rem' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: `${tool.color}10`, padding: '2rem', borderRadius: '2.5rem' }}>{tool.icon}</div>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{tool.label}</h3>
              <p style={{ fontSize: '1rem', color: 'var(--muted)', marginTop: '0.75rem' }}>Full Vision Decomposition</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dynamic Report View */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ marginBottom: '6rem' }}>
            <div className="card" style={{ padding: '4rem', border: '2px solid rgba(59, 130, 246, 0.4)' }}>
               {isAnalyzing && <div className="scan-line" />}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                  <h2 className="glitter-text" style={{ fontSize: '3rem' }}>{activeAnalyzer} Eye</h2>
                  <button onClick={() => setActiveAnalyzer(null)} className="secondary" style={{ padding: '0.75rem', borderRadius: '50%' }}><X size={28} /></button>
               </div>
               {!analysisResult && !isAnalyzing && (
                 <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <ScanSearch size={64} color="#3b82f6" style={{ marginBottom: '2.5rem' }} />
                    <h3 style={{ fontSize: '1.8rem' }}>Inject Bio-Data Archive</h3>
                    <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>Spectral sensors awaiting high-fidelity input</p>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                 </div>
               )}
               {isAnalyzing && (
                 <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                   <BrainCircuit className="spinning" size={80} color="#3b82f6" />
                   <h3 style={{ marginTop: '3rem', fontSize: '1.8rem' }}>Decompiling Molecular Signals...</h3>
                   <div style={{ width: '300px', height: '8px', background: '#f1f5f9', borderRadius: '4px', margin: '3rem auto', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 4, repeat: Infinity }} style={{ height: '100%', background: 'var(--primary)' }} />
                   </div>
                 </div>
               )}
               {analysisResult && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                       {analysisResult.metrics?.map((m: any, i: number) => (
                         <div key={i} className="card" style={{ padding: '2.5rem', background: 'white' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 900 }}>{m.label}</p>
                            <p style={{ fontSize: '3rem', fontWeight: 950, margin: '1rem 0' }}>{m.value} <span style={{ fontSize: '1.2rem', color: '#3b82f6' }}>{m.unit}</span></p>
                            <span className="badge" style={{ background: m.status === 'Normal' ? '#dcfce7' : '#fee2e2', color: m.status === 'Normal' ? '#166534' : '#991b1b', border: 'none' }}>{m.status}</span>
                         </div>
                       ))}
                    </div>
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3.5rem', marginBottom: '6rem' }}>
        <div className="card" style={{ padding: '4rem', display: 'flex', alignItems: 'center', gap: '4rem' }}>
           <div style={{ width: '160px', height: '160px', background: 'var(--primary)', borderRadius: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '4rem', fontWeight: 950, boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4)' }}>
              {bmi}
           </div>
           <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 950 }}>Biometric Arch</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 950, color: '#3b82f6', marginTop: '0.5rem' }}>
                {bmi && bmi < 18.5 ? "DIVERGENT" : bmi && bmi < 25 ? "OPTIMAL" : "CRITICAL"}
              </p>
           </div>
        </div>
        <div className="card" style={{ background: '#020617', color: 'white', padding: '4rem' }}>
           <p style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.4em' }}>EVOLUTION MISSION</p>
           <h2 style={{ fontSize: '3.5rem', margin: '1.5rem 0', fontWeight: 950 }}>{profile.goal}</h2>
           <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px', overflow: 'hidden', marginTop: '2rem' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} style={{ height: '100%', background: 'white' }} />
           </div>
        </div>
      </div>

      {/* Two Agents Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem' }}>
        {/* Agent 1: Spectral Analyst */}
        <section className="card" style={{ padding: '0' }}>
          {isAnalyzingFood && <div className="scan-line" />}
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <span className="badge">AGENT_SPECTRAL_EYE</span>
            <h2 className="glitter-text" style={{ fontSize: '2.8rem', marginTop: '1.5rem' }}>Food Analyst</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Deep spectral mineral & vitamin identifier</p>
            
            {!foodResult && !isAnalyzingFood && (
              <button className="primary" style={{ margin: '4rem auto 0', width: '100%' }} onClick={() => foodInputRef.current?.click()}>
                 <Camera size={24} /> LAUNCH SPECTRAL SCANNER
              </button>
            )}
            <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*" />
          </div>

          {isAnalyzingFood && (
            <div style={{ textAlign: 'center', paddingBottom: '6rem' }}>
               <BrainCircuit className="spinning" size={64} color="#3b82f6" />
               <h3 style={{ marginTop: '2.5rem', fontWeight: 900 }}>MAPPING NUTRIENT LATTICE...</h3>
            </div>
          )}

          {foodResult && (
            <div style={{ padding: '0 4rem 4rem' }}>
               <div style={{ borderRadius: '2rem', overflow: 'hidden', marginBottom: '2rem', border: '5px solid white', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                  <img src={foodImagePreview || ''} alt="Analyzed" style={{ width: '100%', height: 'auto' }} />
               </div>
               <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {foodResult.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="card" style={{ padding: '2rem', background: 'white' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '1.3rem', fontWeight: 900 }}>{ing.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                             <button onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})}><Minus size={16} /></button>
                             <span style={{ fontWeight: 950 }}>{servingSizes[i]}g</span>
                             <button onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})}><Plus size={16} /></button>
                          </div>
                       </div>
                       <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '1rem' }}>
                         {Object.entries(ing.vitamins).slice(0, 4).map(([k, v]: any) => (
                           <div key={k}><p style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 900 }}>{k.toUpperCase()}</p><p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{v}</p></div>
                         ))}
                       </div>
                    </div>
                  ))}
               </div>
               <button className="secondary" style={{ width: '100%', marginTop: '2.5rem' }} onClick={() => setFoodResult(null)}>RESET SCANNER</button>
            </div>
          )}
        </section>

        {/* Agent 2: Bio-Kinetic Architect */}
        <section className="card" style={{ padding: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="badge">AGENT_DIET_ARCHITECT</span>
            <h2 className="glitter-text" style={{ fontSize: '2.8rem', marginTop: '1.5rem' }}>Diet Planner</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Synthetic matrix for goal optimization</p>
          </div>

          {!dietPlan && !loadingDiet && (
            <button className="primary" style={{ width: '100%', height: '280px', flexDirection: 'column' }} onClick={generateDiet}>
               <Sparkles size={48} style={{ marginBottom: '1rem' }} /> CREATE OPTIMAL PLAN
            </button>
          )}

          {loadingDiet && (
            <div style={{ textAlign: 'center', padding: '10rem 0' }}>
               <RefreshCw className="spinning" size={64} color="#f59e0b" />
               <h3 style={{ marginTop: '2.5rem', fontWeight: 900 }}>SIMULATING ENERGY PATHWAYS...</h3>
            </div>
          )}

          {dietPlan && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div style={{ display: 'grid', gap: '2rem' }}>
                  {dietPlan.dietPlan.map((item: any, i: number) => (
                    <div key={i} className="card" style={{ padding: '3rem', border: editingMealIndex === i ? '2px solid #f59e0b' : '1px solid #e2e8f0', background: 'white' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                          <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>{item.time} PHASE</span>
                          <button className="secondary" style={{ padding: '0.6rem', borderRadius: '50%' }} onClick={() => setEditingMealIndex(editingMealIndex === i ? null : i)}>
                             {editingMealIndex === i ? <Save size={20} /> : <Edit2 size={20} />}
                          </button>
                       </div>
                       {editingMealIndex === i ? (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input value={item.meal} onChange={e => {
                               const newPlan = {...dietPlan};
                               newPlan.dietPlan[i].meal = e.target.value;
                               setDietPlan(newPlan);
                            }} />
                            <textarea value={item.description} style={{ height: '120px' }} onChange={e => {
                               const newPlan = {...dietPlan};
                               newPlan.dietPlan[i].description = e.target.value;
                               setDietPlan(newPlan);
                            }} />
                         </div>
                       ) : (
                         <>
                            <h3 style={{ fontSize: '2rem', fontWeight: 950 }}>{item.meal}</h3>
                            <p style={{ color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.8, fontSize: '1.1rem' }}>{item.description}</p>
                         </>
                       )}
                    </div>
                  ))}
               </div>
               <button className="secondary" style={{ width: '100%', marginTop: '3rem' }} onClick={generateDiet}>SYNC MATRIX</button>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
