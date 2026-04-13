"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, differenceInMonths } from "date-fns";
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  User, 
  MapPin, 
  Scale, 
  Stethoscope, 
  Target, 
  Calendar as CalendarIcon,
  Upload,
  Plus,
  Trash2,
  Pill
} from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "", dob: "", age: "", gender: "", state: "", country: "", weight: "", height: "", heightUnit: "cm",
    medication: "No", 
    medicationDetails: [{ name: "", dosage: "", frequency: "" }], 
    goal: "",
    uploadedFiles: [] as string[]
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
  
  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medicationDetails: [...formData.medicationDetails, { name: "", dosage: "", frequency: "" }]
    });
  };

  const handleRemoveMedication = (index: number) => {
    const list = [...formData.medicationDetails];
    list.splice(index, 1);
    setFormData({ ...formData, medicationDetails: list });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const list: any = [...formData.medicationDetails];
    list[index][field] = value;
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
    <div className="container flex-center" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AnimatePresence mode="wait">
        <motion.div
           key={step} 
           initial={{ opacity: 0, scale: 0.98, y: 15 }} 
           animate={{ opacity: 1, scale: 1, y: 0 }} 
           exit={{ opacity: 0, scale: 1.02, y: -15 }}
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
           className="card" 
           style={{ width: '100%', maxWidth: '650px', background: '#fff', color: '#111', overflow: 'hidden' }}
        >
          {/* Top Progress Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: '#f1f5f9' }}>
            <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${(step / 5) * 100}%` }} 
               style={{ height: '100%', background: 'var(--primary)' }} 
            />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '3.5rem', marginTop: '1rem' }}>
            <span className="badge">PHASE 0{step}</span>
            <h1 style={{ color: '#111', fontSize: '2.8rem', fontWeight: 950, marginTop: '1rem' }}>
               {step === 1 && "Identity"}
               {step === 2 && "Locality"}
               {step === 3 && "Physique"}
               {step === 4 && "Vitality"}
               {step === 5 && "Ambition"}
            </h1>
          </div>

          <div style={{ minHeight: '350px' }}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label>Subject Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full legal name" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label><CalendarIcon size={14} style={{ display: 'inline', marginRight: '6px' }} /> Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div>
                    <label>Gender Profile</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="">Status</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {formData.age && (
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ padding: '2rem', background: 'var(--primary)', borderRadius: '1.5rem', color: '#fff', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.9 }}>VERIFIED BIOLOGICAL AGE</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#fff', margin: 0 }}>{formData.age}</h2>
                  </motion.div>
                )}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label>Regional Country</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, state: ""})}>
                    <option value="">Select Domicile</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>State / Province</label>
                  {statesMap[formData.country] ? (
                    <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                      <option value="">Select Local Node</option>
                      {statesMap[formData.country].map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={formData.state} placeholder="Manual entry required" onChange={e => setFormData({...formData, state: e.target.value})} />
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label>Biological Mass (kg)</label>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="0.0" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label>Vertical Stature</label>
                    <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="0" />
                  </div>
                  <div>
                    <label>Metric Axis</label>
                    <select value={formData.heightUnit} onChange={e => setFormData({...formData, heightUnit: e.target.value})}>
                        <option value="cm">Centimeters</option>
                        <option value="feet">Feet/In</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                  <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={40} color="#2563eb" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>Inject Bio-Archives</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Select medical or blood test documentation</p>
                    <button className="secondary" style={{ marginTop: '1.5rem', width: '100%' }}>BROWSE FILES</button>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*,application/pdf" 
                    />
                  </div>

                  {formData.uploadedFiles.length > 0 && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {formData.uploadedFiles.map((fn, i) => (
                        <span key={i} className="badge" style={{ fontSize: '0.7rem' }}>{fn}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '3rem' }}>
                    <label>Synthetic Medication Support?</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button style={{ flex: 1 }} className={formData.medication === 'Yes' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'Yes'})}>YES</button>
                        <button style={{ flex: 1 }} className={formData.medication === 'No' ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, medication: 'No'})}>NO</button>
                    </div>
                  </div>

                  {formData.medication === 'Yes' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '2.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Active Protocols:</h4>
                      {formData.medicationDetails.map((med, i) => (
                        <div key={i} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', position: 'relative' }}>
                          <button 
                            onClick={() => handleRemoveMedication(i)} 
                            style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'transparent', padding: '0.5rem' }}
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)' }}>DRUG NAME</p>
                              <input 
                                style={{ marginTop: '0.4rem', padding: '0.6rem' }} 
                                value={med.name} 
                                onChange={e => updateMedication(i, 'name', e.target.value)} 
                                placeholder="e.g. Advil" 
                              />
                            </div>
                            <div>
                               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)' }}>DOSAGE</p>
                               <input 
                                style={{ marginTop: '0.4rem', padding: '0.6rem' }} 
                                value={med.dosage} 
                                onChange={e => updateMedication(i, 'dosage', e.target.value)} 
                                placeholder="500mg" 
                               />
                            </div>
                            <div>
                               <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)' }}>FREQ / DAY</p>
                               <input 
                                style={{ marginTop: '0.4rem', padding: '0.6rem' }} 
                                type="number"
                                value={med.frequency} 
                                onChange={e => updateMedication(i, 'frequency', e.target.value)} 
                                placeholder="3" 
                               />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={handleAddMedication}>
                         <Plus size={16} /> ADD ANOTHER MEDICATION
                      </button>
                    </motion.div>
                  )}
              </div>
            )}

            {step === 5 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button key={goal} className={formData.goal === goal ? 'primary' : 'secondary'} onClick={() => setFormData({...formData, goal})} style={{ height: '140px', flexDirection: 'column', textAlign: 'center', borderRadius: '2rem' }}>
                    <Target size={32} />
                    <span style={{ fontSize: '1rem', fontWeight: 900, marginTop: '1rem' }}>{goal}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '5rem' }}>
            {step > 1 ? (
              <button className="secondary" onClick={handleBack} style={{ flex: 1, borderRadius: '4rem' }}>REVERT</button>
            ) : <div style={{ flex: 1 }} />}
            {step < 5 ? (
              <button className="primary" onClick={handleNext} style={{ flex: 1, borderRadius: '4rem' }} disabled={step === 1 && !formData.name}>PROCEED</button>
            ) : (
              <button className="primary" onClick={handleSubmit} style={{ flex: 1, borderRadius: '4rem' }} disabled={!formData.goal}><Sparkles size={18} /> INITIALIZE ARCHIVE</button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
