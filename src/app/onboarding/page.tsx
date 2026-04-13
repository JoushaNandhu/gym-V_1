"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, differenceInMonths } from "date-fns";
import { 
  ChevronRight, ChevronLeft, Sparkles, User, MapPin, Scale, Stethoscope, Target, Calendar as CalendarIcon,
  Upload, Plus, Trash2, Pill, Activity, ShieldBox, Orbit, Cpu, Zap
} from "lucide-react";

const countries = ["Australia", "Brazil", "Canada", "France", "Germany", "India", "Japan", "South Africa", "United Kingdom", "USA"].sort();
const statesMap: any = {
  "India": ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Tamil Nadu", "West Bengal"].sort(),
  "USA": ["Alabama", "California", "Florida", "Illinois", "Nevada", "New York", "Texas", "Washington"].sort(),
  "United Kingdom": ["England", "Northern Ireland", "Scotland", "Wales"].sort(),
  "Canada": ["Alberta", "British Columbia", "Ontario", "Quebec"].sort(),
  "Germany": ["Bavaria", "Berlin", "Hamburg", "Saxony"].sort(),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "", dob: "", age: "", gender: "", state: "", country: "", weight: "", height: "", heightUnit: "cm",
    medication: "No", medicationDetails: [{ name: "", dosage: "", frequency: "" }], goal: "", uploadedFiles: [] as string[]
  });

  useEffect(() => {
    if (formData.dob) {
      try {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        const years = differenceInYears(today, birthDate);
        const months = differenceInMonths(today, birthDate) % 12;
        let ageStr = `${years}y ${months}m`;
        setFormData(prev => ({ ...prev, age: ageStr }));
      } catch (e) { console.error(e); }
    }
  }, [formData.dob]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleAddMedication = () => {
    setFormData({ ...formData, medicationDetails: [...formData.medicationDetails, { name: "", dosage: "", frequency: "" }] });
  };

  const handleRemoveMedication = (index: number) => {
    const list = [...formData.medicationDetails];
    list.splice(index, 1);
    setFormData({ ...formData, medicationDetails: list });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files).map(f => f.name);
      setFormData({ ...formData, uploadedFiles: [...formData.uploadedFiles, ...fileList] });
    }
  };

  const handleSubmit = () => {
    localStorage.setItem("user_profile", JSON.stringify(formData));
    router.push("/dashboard");
  };

  return (
    <div className="onboarding-bg flex-center" style={{ minHeight: '100vh', background: '#020617', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Animated Mesh Gradients for V4 UI */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #3b82f640 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, #8b5cf640 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

      <AnimatePresence mode="wait">
        <motion.div
           key={step} initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
           transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
           className="cyber-card" 
           style={{ width: '100%', maxWidth: '750px', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', padding: '5rem', borderRadius: '3rem', position: 'relative', zIndex: 1, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
        >
          {/* Progress Indicator */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(step / 5) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #80e2ff)', boxShadow: '0 0 20px #3b82f6' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '2rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', marginBottom: '1.5rem' }}>
              PHASE 0{step} // INITIALIZATION
            </div>
            <h1 style={{ color: '#fff', fontSize: '4.5rem', fontWeight: 950, letterSpacing: '-0.04em', lineHeight: 0.85 }}>
               {step === 1 && "Biological Identity"}
               {step === 2 && "Global Node"}
               {step === 3 && "Physique Axis"}
               {step === 4 && "Clinical Vault"}
               {step === 5 && "Operational Goal"}
            </h1>
          </div>

          <div style={{ minHeight: '400px' }}>
            {step === 1 && (
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.5)' }}>Full Identity Nomenclature</label>
                  <input className="cyber-input" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ENTER FULL NAME" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.5)' }}>Chronological Birth</label>
                    <input className="cyber-input" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.5)' }}>Gender Profile</label>
                    <select className="cyber-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="">SELECT STATUS</option>
                        <option value="Male">MALE</option>
                        <option value="Female">FEMALE</option>
                        <option value="Non-Binary">NON-BINARY</option>
                    </select>
                  </div>
                </div>

                {formData.age && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ padding: '3rem', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: '2rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.3em' }}>CALIBRATED AGE</p>
                    <h2 style={{ fontSize: '4.5rem', fontWeight: 950, color: '#fff', margin: 0 }}>{formData.age}</h2>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div><label>Host Country</label><select className="cyber-input" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, state: ""})}><option value="">SELECT DOMICILE</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label>Local Node (State)</label>{statesMap[formData.country] ? (<select className="cyber-input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}><option value="">SELECT STATE</option>{statesMap[formData.country].map((s: string) => <option key={s} value={s}>{s}</option>)}</select>) : (<input className="cyber-input" type="text" value={formData.state} placeholder="TYPE STATE NAME" onChange={e => setFormData({...formData, state: e.target.value})} />)}</div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div><label>Net Biological Mass (kg)</label><input className="cyber-input" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="00.0" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <div><label>Vertical Stature</label><input className="cyber-input" type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="000" /></div>
                  <div><label>Measurement Axis</label><select className="cyber-input" value={formData.heightUnit} onChange={e => setFormData({...formData, heightUnit: e.target.value})}><option value="cm">CM</option><option value="feet">FT</option></select></div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                  <div className="cyber-upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <Cpu size={48} color="#60a5fa" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#fff', fontSize: '1.8rem' }}>Direct Bio-Upload</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>DOCX, PDF, XLS, JPG supported</p>
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>{formData.uploadedFiles.map((fn, i) => <span key={i} className="cyber-badge">{fn}</span>)}</div>

                  <div style={{ marginTop: '4rem' }}>
                    <label>Assisted Medication Protocol?</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <button style={{ flex: 1 }} className={formData.medication === 'Yes' ? 'cyber-btn-active' : 'cyber-btn'} onClick={() => setFormData({...formData, medication: 'Yes'})}>YES [ON]</button>
                        <button style={{ flex: 1 }} className={formData.medication === 'No' ? 'cyber-btn-active' : 'cyber-btn'} onClick={() => setFormData({...formData, medication: 'No'})}>NO [OFF]</button>
                    </div>
                  </div>
              </div>
            )}

            {step === 5 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button key={goal} className={formData.goal === goal ? 'cyber-btn-active' : 'cyber-btn'} onClick={() => setFormData({...formData, goal})} style={{ height: '160px', flexDirection: 'column', borderRadius: '2.5rem' }}>
                    <Target size={36} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '1rem' }}>{goal}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '3rem', marginTop: '6rem' }}>
            <button className="cyber-btn" onClick={step === 1 ? () => router.push("/login") : handleBack} style={{ flex: 1 }}>{step === 1 ? 'CANCEL' : 'BACK'}</button>
            <button className="cyber-btn-active" onClick={step === 5 ? handleSubmit : handleNext} style={{ flex: 1 }}>{step === 5 ? 'INITIALIZE FINAL' : 'PROCEED'} <ChevronRight size={18} /></button>
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .cyber-input {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
          font-weight: 700 !important;
          letter-spacing: 0.05em !important;
          padding: 1.5rem !important;
          border-radius: 1.25rem !important;
        }
        .cyber-input:focus {
          border-color: #3b82f6 !important;
          background: rgba(255,255,255,0.1) !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2) !important;
        }
        .cyber-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          padding: 1.5rem;
          border-radius: 4rem;
          font-weight: 900;
          transition: all 0.3s;
        }
        .cyber-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .cyber-btn-active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #fff;
          padding: 1.5rem;
          border-radius: 4rem;
          font-weight: 950;
          box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
          transition: all 0.3s;
        }
        .cyber-btn-active:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.6);
        }
        .cyber-upload-zone {
          border: 2px dashed rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.02);
          border-radius: 2.5rem;
          padding: 5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .cyber-upload-zone:hover {
          border-color: #3b82f6;
          background: rgba(255,255,255,0.05);
        }
        .cyber-badge {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
