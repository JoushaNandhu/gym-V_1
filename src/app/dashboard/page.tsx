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
  PieChart
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

  // Food analysis state
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [foodResult, setFoodResult] = useState<any>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);
  const [servingSizes, setServingSizes] = useState<any>({}); // ingredient index -> quantity

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
          body: JSON.stringify({ image: base64String, type: activeAnalyzer })
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

  const handleFoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingFood(true);
    setFoodResult(null);

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
        // Initialize serving sizes with base quantity from AI
        const initialSizes: any = {};
        data.ingredients.forEach((ing: any, i: number) => {
          initialSizes[i] = ing.baseQuantity;
        });
        setServingSizes(initialSizes);
      } catch (err) {
        console.error("Food upload failed", err);
      } finally {
        setIsAnalyzingFood(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateNutrient = (index: number, type: 'protein' | 'carbs' | 'fat') => {
    const ing = foodResult.ingredients[index];
    const qty = servingSizes[index] || 0;
    const val = (ing[type] / ing.baseQuantity) * qty;
    return Math.round(val * 10) / 10;
  };

  const calculateTotal = (type: 'protein' | 'carbs' | 'fat') => {
    if (!foodResult) return 0;
    return foodResult.ingredients.reduce((total: number, _: any, i: number) => {
      return total + calculateNutrient(i, type);
    }, 0).toFixed(1);
  };

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }} onClick={() => router.push("/profile")}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#000', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserIcon color="white" size={32} />
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', lineHeight: 1 }}>{profile.name}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>View & Edit Profile <ChevronRight size={14} style={{ display: 'inline', marginLeft: '4px' }} /></p>
          </div>
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

      {/* Analysis Modals (activeAnalyzer logic remains the same) */}
      <AnimatePresence>
        {activeAnalyzer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <button onClick={() => setActiveAnalyzer(null)} style={{ position: 'absolute', right: '1rem', top: '1rem', padding: '0.5rem', background: 'transparent' }}><X size={20} /></button>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{activeAnalyzer} Analyzer</h2>
                <p style={{ color: 'var(--muted)' }}>Upload an image to extract precise results.</p>
              </div>
              {!analysisResult && !isAnalyzing && (
                <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={40} style={{ margin: '0 auto 1rem', color: 'var(--muted)' }} />
                  <p style={{ fontWeight: 600 }}>Click to upload or drag & drop</p>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                </div>
              )}
              {isAnalyzing && <div style={{ textAlign: 'center', padding: '4rem 0' }}><RefreshCw className="spinning" size={48} style={{ margin: '0 auto 1.5rem', color: 'var(--primary)' }} /><p>AI is decoding your {activeAnalyzer}...</p></div>}
              {analysisResult && (
                <div className="animate-fade-in">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{analysisResult.title}</h3>
                  <p style={{ marginBottom: '2rem' }}>{analysisResult.summary}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {analysisResult.metrics?.map((m: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
                        <div><p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{m.label}</p><p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{m.value} {m.unit}</p></div>
                        <span style={{ padding: '0.4rem 0.75rem', borderRadius: '2rem', fontSize: '0.75rem', background: m.status === 'Normal' ? '#ecfdf5' : '#fef2f2', color: m.status === 'Normal' ? '#059669' : '#dc2626' }}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '1.5rem', background: '#111', color: '#fff', borderRadius: '1rem' }}><p>{analysisResult.interpretation}</p></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Scale size={20} /> Body Mass Index</h2>
            <button className="secondary" style={{ padding: '0.5rem' }} onClick={() => setIsEditingBmi(!isEditingBmi)}><Edit2 size={16} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ background: 'black', color: 'white', padding: '1.5rem 2rem', borderRadius: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 900 }}>{bmi}</span>
            </div>
            <div>
              <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{bmi && bmi < 18.5 ? "Underweight" : bmi && bmi < 25 ? "Healthy Weight" : "Overweight"}</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Based on your latest update.</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'black', color: 'white' }}>
          <p style={{ opacity: 0.6, fontSize: '0.85rem', fontWeight: 700 }}>CURRENT GOAL</p>
          <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{profile.goal}</h2>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '1.5rem' }}>
             <div style={{ height: '100%', width: '45%', background: 'white', borderRadius: '2px' }} />
          </div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.75rem', opacity: 0.8 }}>45% completed</p>
        </div>
      </div>

      {/* Diet Plan Section with Food Analysis */}
      <section className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Utensils size={28} /> AI Nutrition & Tracker</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>Upload your meal to analyze nutrients instantly.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="secondary" style={{ padding: '0.75rem' }} onClick={() => foodInputRef.current?.click()}>
              <Camera size={20} /> <span style={{ marginLeft: '4px' }}>Analyze Meal</span>
            </button>
            <input type="file" ref={foodInputRef} className="hidden" onChange={handleFoodUpload} accept="image/*" />
            <button className="primary" onClick={generateDiet} disabled={loadingDiet}>
              {dietPlan ? "Refresh Plan" : "Get Plan"}
            </button>
          </div>
        </div>

        {/* Food Analysis Result Section */}
        <AnimatePresence>
          {isAnalyzingFood && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 0' }}>
              <RefreshCw className="spinning" size={40} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>Identifying ingredients & vitamins...</p>
            </motion.div>
          )}

          {foodResult && !isAnalyzingFood && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ background: '#f8fafc', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem' }}>🍱 {foodResult.dishName}</h3>
                <button onClick={() => setFoodResult(null)}><X size={20} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#fff', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Protein</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{calculateTotal('protein')}g</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#fff', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Carbs</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{calculateTotal('carbs')}g</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#fff', borderRadius: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Fat</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{calculateTotal('fat')}g</p>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '1rem' }}>INGREDIENTS & QUANTITY</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {foodResult.ingredients.map((ing: any, i: number) => (
                  <div key={i} style={{ background: '#fff', padding: '1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700 }}>{ing.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#10b981' }}>{ing.vitamins.join(', ')}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', borderRadius: '2rem', padding: '0.25rem' }}>
                        <button className="secondary" style={{ padding: '0.25rem', height: 'auto' }} onClick={() => setServingSizes({...servingSizes, [i]: Math.max(0, servingSizes[i] - 10)})}><Minus size={14} /></button>
                        <span style={{ fontWeight: 700, width: '40px', textAlign: 'center' }}>{servingSizes[i]}{ing.unit}</span>
                        <button className="secondary" style={{ padding: '0.25rem', height: 'auto' }} onClick={() => setServingSizes({...servingSizes, [i]: servingSizes[i] + 10})}><Plus size={14} /></button>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '60px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Protein</p>
                        <p style={{ fontWeight: 800 }}>{calculateNutrient(i, 'protein')}g</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Diet Plan Display (dietPlan logic) */}
        {dietPlan && !loadingDiet && !foodResult && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Previous dietPlan display logic... */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>TARGET CALORIES</p>
                  <p style={{ fontSize: '2rem', fontWeight: 900 }}>{dietPlan.totalCalories} kcal</p>
                </div>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>PROTEIN BUDGET</p>
                  <p style={{ fontSize: '2rem', fontWeight: 900 }}>{dietPlan.proteinSuggestion}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {dietPlan.dietPlan.map((item: any, i: number) => (
                  <div key={i} className="card" style={{ padding: '1.5rem' }}>
                    <p style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8' }}>{item.time}</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.meal}</p>
                    <p style={{ fontSize: '0.9rem', color: '#475569' }}>{item.description}</p>
                  </div>
                ))}
              </div>
           </motion.div>
        )}
      </section>
    </div>
  );
}
