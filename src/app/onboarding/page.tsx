"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, differenceInMonths } from "date-fns";
import { 
  ChevronRight, ChevronLeft, Sparkles, Target, Calendar as CalendarIcon,
  Upload, Plus, Trash2, Pill, Activity, Cpu, Zap
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
        let ageStr = `${years} Years, ${months} Months`;
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
      
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, #3b82f630 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, #8b5cf630 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

      <AnimatePresence mode="wait">
        <motion.div
           key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.4 }}
           className="cyber-card" 
           style={{ width: '100%', maxWidth: '700px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '5rem', borderRadius: '2.5rem', position: 'relative', zIndex: 1, boxShadow: '0 50px 100px rgba(0,0,0,0.6)' }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(step / 5) * 100}%` }} style={{ height: '100%', background: '#3b82f6', boxShadow: '0 0 15px #3b82f6' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 900, marginBottom: '1.5rem' }}>
              STEP 0{step} OF 05
            </div>
            <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.02em' }}>
               {step === 1 && "Personal Information"}
               {step === 2 && "Locality Details"}
               {step === 3 && "Physical Details"}
               {step === 4 && "Medical History"}
               {step === 5 && "Application Goal"}
            </h1>
          </div>

          <div style={{ minHeight: '380px' }}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label>Full Name</label>
                  <input className="cyber-input" type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter name" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label>Date of Birth</label>
                    <input className="cyber-input" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div>
                    <label>Gender</label>
                    <select className="cyber-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>
                </div>
                {formData.age && (
                  <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: '1.5rem', textAlign: 'center' }}>
                    <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>YOUR CALCULATED AGE</p>
                    <h2 style={{ fontSize: '3rem', fontWeight: 950, color: '#fff', margin: 0 }}>{formData.age}</h2>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div><label>Country</label><select className="cyber-input" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, state: ""})}><option value="">Select Country</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label>State</label>{statesMap[formData.country] ? (<select className="cyber-input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}><option value="">Select State</option>{statesMap[formData.country].map((s: string) => <option key={s} value={s}>{s}</option>)}</select>) : (<input className="cyber-input" type="text" value={formData.state} placeholder="Enter state" onChange={e => setFormData({...formData, state: e.target.value})} />)}</div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div><label>Weight (kg)</label><input className="cyber-input" type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 70" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div><label>Height</label><input className="cyber-input" type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 170" /></div>
                  <div><label>Unit</label><select className="cyber-input" value={formData.heightUnit} onChange={e => setFormData({...formData, heightUnit: e.target.value})}><option value="cm">cm</option><option value="feet">feet</option></select></div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                  <div className="cyber-upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={32} color="#60a5fa" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#fff' }}>Upload Medical Reports</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>PDF, Images, Excel, Word</p>
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>{formData.uploadedFiles.map((fn, i) => <span key={i} className="cyber-badge">{fn}</span>)}</div>

                  <div style={{ marginTop: '3.5rem' }}>
                    <label>Are you taking any medication?</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <button style={{ flex: 1 }} className={formData.medication === 'Yes' ? 'cyber-btn-active' : 'cyber-btn'} onClick={() => setFormData({...formData, medication: 'Yes'})}>YES</button>
                        <button style={{ flex: 1 }} className={formData.medication === 'No' ? 'cyber-btn-active' : 'cyber-btn'} onClick={() => setFormData({...formData, medication: 'No'})}>NO</button>
                    </div>
                  </div>
              </div>
            )}

            {step === 5 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button key={goal} className={formData.goal === goal ? 'cyber-btn-active' : 'cyber-btn'} onClick={() => setFormData({...formData, goal})} style={{ height: '140px', flexDirection: 'column', borderRadius: '1.5rem' }}>
                    <Target size={32} />
                    <span style={{ fontSize: '1rem', fontWeight: 900, marginTop: '0.5rem' }}>{goal}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '5rem' }}>
            <button className="cyber-btn" onClick={handleBack} disabled={step === 1} style={{ flex: 1 }}>{step === 1 ? 'CANCEL' : 'BACK'}</button>
            <button className="cyber-btn-active" onClick={step === 5 ? handleSubmit : handleNext} style={{ flex: 1 }}>{step === 5 ? 'FINISH' : 'NEXT'} <ChevronRight size={18} /></button>
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .cyber-input { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #fff !important; padding: 1.25rem !important; border-radius: 1rem !important; }
        .cyber-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1.25rem; border-radius: 3rem; font-weight: 900; }
        .cyber-btn-active { background: #3b82f6; color: #fff; padding: 1.25rem; border-radius: 3rem; font-weight: 950; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4); }
        .cyber-upload-zone { border: 2px dashed rgba(255,255,255,0.2); background: rgba(255,255,255,0.03); border-radius: 1.5rem; padding: 3rem; text-align: center; cursor: pointer; }
        .cyber-badge { background: rgba(59,130,246,0.2); color: #60a5fa; padding: 0.4rem 0.8rem; border-radius: 2rem; font-size: 0.7rem; }
        label { color: rgba(255,255,255,0.6); font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-top: 1.5rem; display: block; }
      `}</style>
    </div>
  );
}
