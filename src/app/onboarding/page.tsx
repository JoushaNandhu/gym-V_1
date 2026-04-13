"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, parseISO } from "date-fns";
import { ChevronRight, ChevronLeft, Sparkles, User, MapPin, Scale, Stethoscope, Target, Calendar as CalendarIcon } from "lucide-react";

// Simplified list for countries and states (sample)
const countries = [
  "India", "USA", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "South Africa"
];

const statesMap: any = {
  "India": ["Tamil Nadu", "Karnataka", "Maharashtra", "Delhi", "Kerala", "Gujarat", "Punjab", "West Bengal"],
  "USA": ["California", "Texas", "New York", "Florida", "Illinois", "Washington", "Nevada"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta"],
  // Add more as needed or default to a text input if not in map
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", dob: "", age: "", gender: "", state: "", country: "", weight: "", height: "", heightUnit: "cm",
    medication: "No", medicationDetails: [{ name: "", dosage: "", frequency: "" }], goal: "",
  });

  useEffect(() => {
    if (formData.dob) {
      try {
        const birthDate = new Date(formData.dob);
        const age = differenceInYears(new Date(), birthDate);
        setFormData(prev => ({ ...prev, age: age.toString() }));
      } catch (e) {
        console.error("Date error", e);
      }
    }
  }, [formData.dob]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  const handleSubmit = () => {
    localStorage.setItem("user_profile", JSON.stringify(formData));
    router.push("/dashboard");
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        <motion.div
           key={step} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
           className="card" style={{ width: '100%', maxWidth: '600px', padding: '3.5rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge" style={{ marginBottom: '1.25rem' }}>PHASE 0{step}</span>
            <h1 className="glitter-text" style={{ fontSize: '2.8rem', letterSpacing: '-0.05em' }}>
               {step === 1 && "Identity"}
               {step === 2 && "Locality"}
               {step === 3 && "Physique"}
               {step === 4 && "Vitality"}
               {step === 5 && "Ambition"}
            </h1>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label>Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div>
                  <label><CalendarIcon size={14} style={{ display: 'inline', marginRight: '6px' }} /> Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.dob} 
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    style={{ colorScheme: 'dark' }} // Ensures calendar is visible in dark theme
                  />
                </div>
                <div>
                   <label>Gender</label>
                   <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option value="">Status</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Private</option>
                   </select>
                </div>
              </div>

              {formData.age && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--primary)', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 0 20px var(--primary-glow)' }}
                >
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.8 }}>CALCULATED CHRONOLOGICAL AGE</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{formData.age} Years</h2>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label><MapPin size={14} /> Living Country</label>
              <select 
                value={formData.country} 
                onChange={e => setFormData({...formData, country: e.target.value, state: ""})}
              >
                <option value="">Select Country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div style={{ marginTop: '2rem' }}>
                <label><MapPin size={14} /> State / Province</label>
                {statesMap[formData.country] ? (
                  <select 
                    value={formData.state} 
                    onChange={e => setFormData({...formData, state: e.target.value})}
                  >
                    <option value="">Select State</option>
                    {statesMap[formData.country].map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={formData.state} 
                    placeholder="Enter State" 
                    onChange={e => setFormData({...formData, state: e.target.value})} 
                  />
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label><Scale size={14} /> Current Body Mass (kg)</label>
              <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="0.0" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div>
                   <label>Height Value</label>
                   <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="0.0" />
                </div>
                <div>
                   <label>Measurement Unit</label>
                   <select value={formData.heightUnit} onChange={e => setFormData({...formData, heightUnit: e.target.value})}>
                      <option value="cm">cm</option>
                      <option value="feet">ft</option>
                   </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ padding: '3rem', border: '1px solid var(--border)', borderRadius: '1.5rem', background: 'var(--secondary)', textAlign: 'center' }}>
                   <Stethoscope size={48} color="#a855f7" style={{ marginBottom: '1.5rem' }} />
                   <h3>Upload Biometric Records</h3>
                   <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Medical & Lab Archives (Optional)</p>
                   <button className="secondary" style={{ width: '100%', marginTop: '2.5rem', borderRadius: '3rem' }}>Browse Archives</button>
                </div>
                <div style={{ marginTop: '3.5rem' }}>
                   <label>Active Medication Program?</label>
                   <div className="button-group" style={{ marginTop: '1rem' }}>
                      <button style={{ flex: 1 }} className={formData.medication === 'Yes' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'Yes'})}>YES</button>
                      <button style={{ flex: 1 }} className={formData.medication === 'No' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'No'})}>NO</button>
                   </div>
                </div>
             </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <label>Select Your Biological Objective</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button key={goal} className={formData.goal === goal ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, goal})} style={{ height: '140px', flexDirection: 'column', gap: '1rem' }}>
                    <Target size={32} />
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{goal}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="button-group" style={{ marginTop: '4.5rem' }}>
            {step > 1 ? (
              <button className="secondary" style={{ borderRadius: '3rem' }} onClick={handleBack}><ChevronLeft size={20} /> Back</button>
            ) : <div />}
            {step < 5 ? (
              <button className="primary" style={{ borderRadius: '3rem' }} onClick={handleNext} disabled={step === 1 && !formData.name}>Next Phase <ChevronRight size={20} /></button>
            ) : (
              <button className="primary" style={{ borderRadius: '3rem' }} onClick={handleSubmit} disabled={!formData.goal}><Sparkles size={20} /> Complete Calibration</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
