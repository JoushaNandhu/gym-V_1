"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, 
  Camera, 
  Plus, 
  Minus, 
  Sparkles, 
  BrainCircuit, 
  ChevronLeft, 
  Zap,
  Edit2,
  Save,
  ScanSearch,
  X,
  FileText,
  RefreshCw
} from "lucide-react";

export default function NutritionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<any>(null);
  const [foodImagePreview, setFoodImagePreview] = useState<string | null>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [servingSizes, setServingSizes] = useState<any>({});
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const p = localStorage.getItem("user_profile");
    if (p) setProfile(JSON.parse(p));
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAnalyzingFood) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const inc = Math.floor(Math.random() * 8) + 1;
          return prev + inc;
        });
      }, 400);
    } else {
      setProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzingFood]);

  const generateDiet = async () => {
    setLoadingDiet(true);
    setFoodResult(null);
    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        body: JSON.stringify({ goal: profile.goal, country: profile.country, state: profile.state })
      });
      const data = await res.json();
      setDietPlan(data);
    } catch (e) { console.error(e); } finally { setLoadingDiet(false); }
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

  const calculateTotal = (type: 'protein' | 'carbs' | 'fat' | 'calories') => {
    if (!foodResult) return 0;
    return foodResult.ingredients.reduce((total: number, ing: any, i: number) => {
      const qty = servingSizes[i] || 0;
      return total + ((ing[type] / ing.baseQuantity) * qty);
    }, 0).toFixed(1);
  };

  return (
    <div className="container" style={{ background: '#fdfdfd', minHeight: '100vh' }}>
      <header style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button className="secondary" style={{ borderRadius: '50%', padding: '1rem' }} onClick={() => router.push("/dashboard")}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <span className="badge">AGENT_NUTRITION_12</span>
          <h1 className="glitter-text" style={{ fontSize: '3.5rem' }}>Bio-Kinetic Diet</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem' }}>
        <section className="card" style={{ padding: '0', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
           <div style={{ padding: '4rem', textAlign: 'center' }}>
              <span className="badge">AI_IDENTIFIER</span>
              <h2 style={{ fontSize: '2.5rem', marginTop: '1.5rem', fontWeight: 950 }}>Spectral Analyst</h2>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Automated molecular nutrient decompilation</p>
              
              {!foodResult && !isAnalyzingFood && (
                <button className="primary" style={{ margin: '3rem auto 0', width: '100%' }} onClick={() => foodInputRef.current?.click()}>
                   <Camera size={24} /> LAUNCH SPECTRAL SCAN
                </button>
              )}
              <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*,.pdf,.xls,.xlsx,.doc,.docx" />
           </div>

           <AnimatePresence>
             {isAnalyzingFood && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', paddingBottom: '6rem' }}>
                 <BrainCircuit className="spinning" size={80} color="#3b82f6" style={{ margin: '0 auto 3rem' }} />
                 <h2 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#3b82f6' }}>{progress}%</h2>
                 <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '1rem' }}>MAPPING NUTRIENT MATRIX v4.0...</p>
                 <div style={{ width: '300px', height: '10px', background: '#f1f5f9', borderRadius: '5px', margin: '2rem auto', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
                 </div>
              </motion.div>
             )}
           </AnimatePresence>

           {foodResult && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0 4rem 4rem' }}>
                <div style={{ borderRadius: '2rem', overflow: 'hidden', marginBottom: '2rem', border: '5px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                   <img src={foodImagePreview || ''} alt="Analyzed" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                   <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 800 }}>ENERGY_DENSITY</p>
                      <p style={{ fontSize: '2.2rem', fontWeight: 950 }}>{calculateTotal('calories')} <span style={{ fontSize: '1rem' }}>kcal</span></p>
                   </div>
                   <div className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px solid #3b82f630' }}>
                      <p style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 800 }}>AMINO_BASE</p>
                      <p style={{ fontSize: '2.2rem', fontWeight: 950 }}>{calculateTotal('protein')} <span style={{ fontSize: '1rem' }}>g</span></p>
                   </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   {foodResult.ingredients.map((ing: any, i: number) => (
                     <div key={i} className="card" style={{ padding: '2rem', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontWeight: 950, fontSize: '1.2rem' }}>{ing.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                           <button onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})}><Minus size={14} /></button>
                           <span style={{ fontWeight: 950, fontSize: '1.1rem', minWidth: '40px', textAlign: 'center' }}>{servingSizes[i]}g</span>
                           <button onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})}><Plus size={14} /></button>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="secondary" style={{ width: '100%', marginTop: '3rem' }} onClick={() => setFoodResult(null)}><X size={16} /> RESET SCANNER</button>
             </motion.div>
           )}
        </section>

        <section className="card" style={{ padding: '4rem' }}>
           <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="badge">AI_ARCHITECT</span>
              <h2 style={{ fontSize: '2.5rem', marginTop: '1.5rem', fontWeight: 950 }}>Diet Architect</h2>
              <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Synthetic optimization of nutritional energy</p>
           </div>

           {!dietPlan && !loadingDiet && (
             <button className="primary" style={{ width: '100%', height: '300px', flexDirection: 'column' }} onClick={generateDiet}>
                <Zap size={48} style={{ marginBottom: '1.5rem' }} /> CREATE SYNTHETIC PLAN
             </button>
           )}

           {loadingDiet && (
             <div style={{ textAlign: 'center', padding: '10rem 0' }}>
                <RefreshCw className="spinning" size={64} color="#f59e0b" />
                <h3 style={{ marginTop: '2.5rem', fontWeight: 900 }}>SYNTHESIZING MACROS...</h3>
             </div>
           )}

           {dietPlan && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'grid', gap: '2rem' }}>
                   {dietPlan.dietPlan.map((item: any, i: number) => (
                     <div key={i} className="card" style={{ padding: '3rem', background: 'white', border: editingMealIndex === i ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                           <span className="badge" style={{ background: '#3b82f610', color: '#3b82f6' }}>{item.time} PHASE</span>
                           <button className="secondary" style={{ padding: '0.65rem', borderRadius: '50%' }} onClick={() => setEditingMealIndex(editingMealIndex === i ? null : i)}>
                              {editingMealIndex === i ? <Save size={18} /> : <Edit2 size={18} />}
                           </button>
                        </div>
                        {editingMealIndex === i ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                             <input value={item.meal} onChange={e => {
                                const newP = {...dietPlan};
                                newP.dietPlan[i].meal = e.target.value;
                                setDietPlan(newP);
                             }} />
                             <textarea value={item.description} style={{ height: '110px' }} onChange={e => {
                                const newP = {...dietPlan};
                                newP.dietPlan[i].description = e.target.value;
                                setDietPlan(newP);
                             }} />
                          </div>
                        ) : (
                          <>
                             <h3 style={{ fontSize: '1.9rem', fontWeight: 950 }}>{item.meal}</h3>
                             <p style={{ color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.8, fontSize: '1.05rem' }}>{item.description}</p>
                          </>
                        )}
                     </div>
                   ))}
                </div>
                <button className="secondary" style={{ width: '100%', marginTop: '3rem' }} onClick={generateDiet}>SYNC ARCHIVE</button>
             </motion.div>
           )}
        </section>
      </div>
    </div>
  );
}
