"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";
import { ChevronRight, ChevronLeft, Sparkles, User, MapPin, Scale, Stethoscope, Target, Calendar as CalendarIcon } from "lucide-react";

// Alphabetically sorted countries
const countries = [
  "Australia", "Brazil", "Canada", "France", "Germany", "India", "Japan", "South Africa", "United Kingdom", "USA"
].sort();

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
  const [formData, setFormData] = useState({
    name: "", dob: "", age: "", gender: "", state: "", country: "", weight: "", height: "", heightUnit: "cm",
    medication: "No", medicationDetails: [{ name: "", dosage: "", frequency: "" }], goal: "",
  });

  useEffect(() => {
    if (formData.dob) {
      try {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        const years = differenceInYears(today, birthDate);
        const months = differenceInMonths(today, birthDate) % 12;
        
        let ageStr = `${years} Years`;
        if (months > 0) ageStr += `, ${months} Month${months > 1 ? 's' : ''}`;
        
        setFormData(prev => ({ ...prev, age: ageStr }));
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
    <div className="container flex-center">
      <AnimatePresence mode="wait">
        <motion.div
           key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
           className="card" style={{ width: '100%', maxWidth: '650px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge">PHASE 0{step}</span>
            <h1 className="glitter-text" style={{ fontSize: '3rem', marginTop: '1rem' }}>
               {step === 1 && "Personal Identity"}
               {step === 2 && "Global Locality"}
               {step === 3 && "Physical Base"}
               {step === 4 && "Clinical Archive"}
               {step === 5 && "Core Ambition"}
            </h1>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }}>
              <label>Full Identity Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
              
              <div className="grid-2" style={{ marginTop: '2rem' }}>
                <div>
                  <label><CalendarIcon size={14} style={{ display: 'inline', marginRight: '6px' }} /> Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div>
                   <label>Gender Profile</label>
                   <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                   </select>
                </div>
              </div>

              {formData.age && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ marginTop: '2.5rem', padding: '2rem', background: 'var(--primary)', borderRadius: '1.25rem', color: 'white', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.9 }}>VERIFIED BIOLOGICAL AGE</p>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>{formData.age}</h2>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }}>
              <label><MapPin size={14} /> Domicile Country</label>
              <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, state: ""})}>
                <option value="">Select Country (Ascending)</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div style={{ marginTop: '2rem' }}>
                <label><MapPin size={14} /> State / Province / Territory</label>
                {statesMap[formData.country] ? (
                  <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                    <option value="">Select State (Ascending)</option>
                    {statesMap[formData.country].map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input type="text" value={formData.state} placeholder="Enter State/Province" onChange={e => setFormData({...formData, state: e.target.value})} />
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }}>
              <label><Scale size={14} /> Net Mass (kg)</label>
              <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="70.5" />
              <div className="grid-2" style={{ marginTop: '2.5rem' }}>
                <div>
                   <label>Biological Height</label>
                   <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="175" />
                </div>
                <div>
                   <label>Measurement Axis</label>
                   <select value={formData.heightUnit} onChange={e => setFormData({...formData, heightUnit: e.target.value})}>
                      <option value="cm">cm</option>
                      <option value="feet">ft/in</option>
                   </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div initial={{ opacity: 0 }}>
                <div className="upload-zone" style={{ border: '2px dashed #e2e8f0', background: '#fff' }}>
                   <Stethoscope size={48} color="var(--primary-solid)" style={{ marginBottom: '1rem' }} />
                   <h3 style={{ color: '#0f172a' }}>Sync Health Records</h3>
                   <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Inject biological data (Optional)</p>
                   <button className="secondary" style={{ width: '100%', marginTop: '2rem' }}>Open Archives</button>
                </div>
                <div style={{ marginTop: '3.5rem' }}>
                   <label>Chemical Medication Program?</label>
                   <div className="button-group" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button style={{ flex: 1 }} className={formData.medication === 'Yes' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'Yes'})}>YES</button>
                      <button style={{ flex: 1 }} className={formData.medication === 'No' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'No'})}>NO</button>
                   </div>
                </div>
             </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button key={goal} className={formData.goal === goal ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, goal})} style={{ height: '140px', flexDirection: 'column', borderRadius: '1.5rem' }}>
                    <Target size={32} />
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>{goal}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="button-group" style={{ display: 'flex', gap: '2rem', marginTop: '4rem' }}>
            {step > 1 ? (
              <button className="secondary" onClick={handleBack} style={{ flex: 1 }}><ChevronLeft size={18} /> Back</button>
            ) : <div style={{ flex: 1 }} />}
            {step < 5 ? (
              <button className="primary" onClick={handleNext} style={{ flex: 1 }} disabled={step === 1 && !formData.name}>Next Phase <ChevronRight size={18} /></button>
            ) : (
              <button className="primary" onClick={handleSubmit} style={{ flex: 1 }} disabled={!formData.goal}><Sparkles size={18} /> Finish Setup</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
