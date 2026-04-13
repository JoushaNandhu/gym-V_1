"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears } from "date-fns";
import { ChevronRight, ChevronLeft, Sparkles, User, MapPin, Scale, Stethoscope, Target } from "lucide-react";

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
        const age = differenceInYears(new Date(), new Date(formData.dob));
        setFormData(prev => ({ ...prev, age: age.toString() }));
      } catch (e) { console.error(e); }
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
           key={step} initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -50, scale: 0.95 }}
           className="card" style={{ width: '100%', maxWidth: '550px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge" style={{ marginBottom: '1rem' }}>Step {step} of 5</span>
            <h1 className="glitter-text" style={{ fontSize: '2.5rem' }}>
               {step === 1 && "Identity"}
               {step === 2 && "Locality"}
               {step === 3 && "Physique"}
               {step === 4 && "Vitality"}
               {step === 5 && "Ambition"}
            </h1>
            <p style={{ color: 'var(--muted)' }}>Precision Calibration Required</p>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label><User size={14} /> Subject Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full legal name" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label>Birth Date</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div>
                   <label>Gender</label>
                   <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option value="">Status</option>
                      <option value="Male">Alpha (M)</option>
                      <option value="Female">Alpha (F)</option>
                      <option value="Prefer not to say">Private</option>
                   </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label><MapPin size={14} /> Regional Zone (Country)</label>
              <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="e.g. India" />
              <label><MapPin size={14} /> Sector (State)</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="e.g. Tamil Nadu" />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label><Scale size={14} /> Mass (kg)</label>
              <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="Weight in kg" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                   <label>Height</label>
                   <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="Values" />
                </div>
                <div>
                   <label>Unit</label>
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
                <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '1rem', background: 'var(--secondary)', textAlign: 'center' }}>
                   <Stethoscope size={32} color="#a855f7" style={{ marginBottom: '1rem' }} />
                   <h3>Upload Bio-Archives</h3>
                   <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Medical & Blood analysis files</p>
                   <button className="secondary" style={{ width: '100%', marginTop: '1.5rem' }}>Select Archives</button>
                </div>
                <div style={{ marginTop: '2.5rem' }}>
                   <label>Synthetic Medication Support?</label>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                      <button className={formData.medication === 'Yes' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'Yes'})}>Positive</button>
                      <button className={formData.medication === 'No' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'No'})}>Negative</button>
                   </div>
                </div>
             </motion.div>
          )}

          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button key={goal} className={formData.goal === goal ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, goal})} style={{ height: '120px', flexDirection: 'column' }}>
                    <Target size={24} style={{ marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem' }}>{goal}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="button-group" style={{ marginTop: '4rem' }}>
            {step > 1 ? (
              <button className="secondary" onClick={handleBack}><ChevronLeft size={20} /> Revert</button>
            ) : <div />}
            {step < 5 ? (
              <button className="primary" onClick={handleNext} disabled={step === 1 && !formData.name}>Proceed <ChevronRight size={20} /></button>
            ) : (
              <button className="primary" onClick={handleSubmit} disabled={!formData.goal}><Sparkles size={20} /> Synchronize Profile</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
