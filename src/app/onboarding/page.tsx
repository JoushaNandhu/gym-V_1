"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInYears, parseISO } from "date-fns";
import { ChevronRight, ChevronLeft, Upload, Minus, Plus } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    gender: "",
    state: "",
    country: "",
    weight: "",
    height: "",
    heightUnit: "cm",
    medication: "No",
    medicationDetails: [{ name: "", dosage: "", frequency: "" }],
    goal: "",
  });

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const s = localStorage.getItem("user_session");
    if (!s) {
      router.push("/login");
    } else {
      setSession(JSON.parse(s));
    }
  }, [router]);

  useEffect(() => {
    if (formData.dob) {
      try {
        const age = differenceInYears(new Date(), new Date(formData.dob));
        setFormData(prev => ({ ...prev, age: age.toString() }));
      } catch (e) {
        console.error("Invalid date", e);
      }
    }
  }, [formData.dob]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    // In a real app, send to API
    localStorage.setItem("user_profile", JSON.stringify(formData));
    router.push("/dashboard");
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medicationDetails: [...prev.medicationDetails, { name: "", dosage: "", frequency: "" }]
    }));
  };

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="card"
        >
          {step === 1 && (
            <div>
              <div className="step-header">
                <h1>Basic Info</h1>
                <p>Let's start with the basics</p>
              </div>
              <label>Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Enter your name"
              />
              
              <label style={{ marginTop: '1rem', display: 'block' }}>Date of Birth</label>
              <input 
                type="date" 
                value={formData.dob} 
                onChange={e => setFormData({...formData, dob: e.target.value})} 
              />
              
              {formData.age && (
                <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>Calculated Age: {formData.age}</p>
              )}

              <label style={{ marginTop: '1rem', display: 'block' }}>Gender</label>
              <select 
                value={formData.gender} 
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="step-header">
                <h1>Location</h1>
                <p>This helps us recommend regional food</p>
              </div>
              <label>Country</label>
              <input 
                type="text" 
                value={formData.country} 
                onChange={e => setFormData({...formData, country: e.target.value})} 
                placeholder="e.g. India, USA"
              />
              
              <label style={{ marginTop: '1rem', display: 'block' }}>State / Region</label>
              <input 
                type="text" 
                value={formData.state} 
                onChange={e => setFormData({...formData, state: e.target.value})} 
                placeholder="e.g. Tamil Nadu, California"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="step-header">
                <h1>Physical Details</h1>
                <p>Your current measurements</p>
              </div>
              <label>Weight (kg)</label>
              <input 
                type="number" 
                value={formData.weight} 
                onChange={e => setFormData({...formData, weight: e.target.value})} 
                placeholder="65"
              />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ flex: 2 }}>
                  <label>Height</label>
                  <input 
                    type="number" 
                    value={formData.height} 
                    onChange={e => setFormData({...formData, height: e.target.value})} 
                    placeholder={formData.heightUnit === 'cm' ? '175' : '5.9'}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Unit</label>
                  <select 
                    value={formData.heightUnit} 
                    onChange={e => setFormData({...formData, heightUnit: e.target.value})}
                  >
                    <option value="cm">cm</option>
                    <option value="feet">feet</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="step-header">
                <h1>Medical Record (Optional)</h1>
                <p>Store your health data securely</p>
              </div>
              
              <div style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>
                <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                <p>Upload Medical Reports (PDF/JPG)</p>
                <input type="file" className="hidden" id="medical-upload" />
                <button onClick={() => document.getElementById('medical-upload')?.click()} className="secondary" style={{ marginTop: '1rem' }}>Browse</button>
              </div>

              <div style={{ border: '2px dashed var(--border)', padding: '2rem', textAlign: 'center', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>
                <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                <p>Upload Blood Test Reports (PDF/JPG)</p>
                <input type="file" className="hidden" id="blood-upload" />
                <button onClick={() => document.getElementById('blood-upload')?.click()} className="secondary" style={{ marginTop: '1rem' }}>Browse</button>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <label>Are you taking any regular medication?</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    className={formData.medication === 'Yes' ? 'primary' : 'secondary'} 
                    onClick={() => setFormData({...formData, medication: 'Yes'})}
                    style={{ flex: 1 }}
                  >Yes</button>
                  <button 
                    className={formData.medication === 'No' ? 'primary' : 'secondary'} 
                    onClick={() => setFormData({...formData, medication: 'No'})}
                    style={{ flex: 1 }}
                  >No</button>
                </div>
              </div>

              {formData.medication === 'Yes' && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Medication Details</p>
                  {formData.medicationDetails.map((med, index) => (
                    <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--secondary)', borderRadius: 'var(--radius)' }}>
                      <label>Medicine Name</label>
                      <input 
                        type="text" 
                        value={med.name} 
                        onChange={e => {
                          const newMeds = [...formData.medicationDetails];
                          newMeds[index].name = e.target.value;
                          setFormData({...formData, medicationDetails: newMeds});
                        }} 
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <label>Dosage</label>
                          <input 
                            type="text" 
                            value={med.dosage} 
                            placeholder="e.g. 500mg"
                            onChange={e => {
                              const newMeds = [...formData.medicationDetails];
                              newMeds[index].dosage = e.target.value;
                              setFormData({...formData, medicationDetails: newMeds});
                            }} 
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label>Freq / day</label>
                          <input 
                            type="number" 
                            value={med.frequency} 
                            placeholder="2"
                            onChange={e => {
                              const newMeds = [...formData.medicationDetails];
                              newMeds[index].frequency = e.target.value;
                              setFormData({...formData, medicationDetails: newMeds});
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="secondary" onClick={addMedication} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add Another
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="step-header">
                <h1>Goal Selection</h1>
                <p>What do you want to achieve?</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {['Weight Gain', 'Weight Loss', 'Healthy', 'Muscle Gain'].map(goal => (
                  <button 
                    key={goal}
                    className={formData.goal === goal ? 'primary' : 'secondary'}
                    onClick={() => setFormData({...formData, goal})}
                    style={{ height: '100px', fontSize: '1.1rem' }}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="button-group">
            {step > 1 ? (
              <button className="secondary" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronLeft size={20} /> Back
              </button>
            ) : <div />}
            
            {step < 5 ? (
              <button 
                className="primary" 
                onClick={handleNext} 
                disabled={step === 1 && (!formData.name || !formData.dob || !formData.gender)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                className="primary" 
                onClick={handleSubmit}
                disabled={!formData.goal}
              >
                Complete Profile
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
