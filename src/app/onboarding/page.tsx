"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, differenceInMonths } from "date-fns";
import { ChevronRight, ChevronLeft, Sparkles, User, MapPin, Scale, Stethoscope, Target, Calendar as CalendarIcon } from "lucide-react";

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
    <div className="container flex-center" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AnimatePresence mode="wait">
        <motion.div
           key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
           className="card" style={{ width: '100%', maxWidth: '600px', background: '#fff', color: '#111' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge">STEP 0{step}</span>
            <h1 style={{ color: '#111', fontSize: '2.5rem', marginTop: '1rem' }}>
               {step === 1 && "Basic Information"}
               {step === 2 && "Global Location"}
               {step === 3 && "Physical Details"}
               {step === 4 && "Medical History"}
               {step === 5 && "Health Goals"}
            </h1>
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label>First & Last Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Smith" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label><CalendarIcon size={14} style={{ display: 'inline', marginRight: '6px' }} /> Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} style={{ background: '#fff' }} />
                </div>
                <div>
                   <label>Gender</label>
                   <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{ background: '#fff' }}>
                      <option value="">Choose one</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                   </select>
                </div>
              </div>

              {formData.age && (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#2563eb', borderRadius: '1rem', color: '#fff', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>VERIFIED AGE</p>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{formData.age}</h2>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label>Country</label>
                <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, state: ""})} style={{ background: '#fff' }}>
                  <option value="">Select Region</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label>State / Province</label>
                {statesMap[formData.country] ? (
                  <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={{ background: '#fff' }}>
                    <option value="">Select State</option>
                    {statesMap[formData.country].map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input type="text" value={formData.state} placeholder="Type state name" onChange={e => setFormData({...formData, state: e.target.value})} />
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label>Weight (kg)</label>
                <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="75" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                   <label>Height</label>
                   <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="180" />
                </div>
                <div>
                   <label>Unit</label>
                   <select value={formData.heightUnit} onChange={e => setFormData({...formData, heightUnit: e.target.value})} style={{ background: '#fff' }}>
                      <option value="cm">cm</option>
                      <option value="feet">ft</option>
                   </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
             <div>
                <div className="upload-zone">
                   <Stethoscope size={40} color="#2563eb" style={{ marginBottom: '1rem' }} />
                   <h3 style={{ marginBottom: '0.5rem' }}>Attach Lab Results</h3>
                   <p style={{ color: '#666', fontSize: '0.9rem' }}>Upload prescription or blood test images</p>
                   <button className="secondary" style={{ marginTop: '1.5rem', width: '100%' }}>Browse Files</button>
                </div>
                <div style={{ marginTop: '2.5rem' }}>
                   <label>Are you taking any medication?</label>
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button style={{ flex: 1 }} className={formData.medication === 'Yes' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'Yes'})}>YES</button>
                      <button style={{ flex: 1 }} className={formData.medication === 'No' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'No'})}>NO</button>
                   </div>
                </div>
             </div>
          )}

          {step === 5 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                <button key={goal} className={formData.goal === goal ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, goal})} style={{ height: '120px', flexDirection: 'column', textAlign: 'center' }}>
                  <Target size={28} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.5rem' }}>{goal}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4rem' }}>
            {step > 1 ? (
              <button className="secondary" onClick={handleBack} style={{ flex: 1 }}>Back</button>
            ) : <div style={{ flex: 1 }} />}
            {step < 5 ? (
              <button className="primary" onClick={handleNext} style={{ flex: 1 }} disabled={step === 1 && !formData.name}>Next Step</button>
            ) : (
              <button className="primary" onClick={handleSubmit} style={{ flex: 1 }} disabled={!formData.goal}><Sparkles size={18} /> Finish</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
