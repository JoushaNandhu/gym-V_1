"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Droplets, 
  Pill, 
  RefreshCw, 
  Search,
  BrainCircuit, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle,
  FileText,
  ScanSearch,
  X
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [activeAnalyzer, setActiveAnalyzer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          // Random increments to feel authentic
          const inc = Math.floor(Math.random() * 7) + 1;
          return prev + inc;
        });
      }, 300);
    } else {
      setProgress(100);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

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
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container" style={{ background: '#fdfdfd', minHeight: '100vh' }}>
      <header style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button className="secondary" style={{ borderRadius: '50%', padding: '1rem' }} onClick={() => router.push("/dashboard")}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <span className="badge">AGENT_BIOMETRIC_7</span>
          <h1 className="glitter-text" style={{ fontSize: '3.5rem' }}>Quantum Analyzer</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {[
            { id: 'Medical Report', icon: <Stethoscope size={28} />, label: 'Medical Dossier', color: '#3b82f6' },
            { id: 'Blood Test', icon: <Droplets size={28} />, label: 'Blood Matrix', color: '#ef4444' },
            { id: 'Medication', icon: <Pill size={28} />, label: 'Chemical Ledger', color: '#10b981' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ x: 10 }}
              className="card" 
              style={{ 
                cursor: 'pointer', padding: '2rem', 
                border: activeAnalyzer === tool.id ? '2px solid #3b82f6' : '1px solid var(--border)',
                background: activeAnalyzer === tool.id ? '#3b82f605' : 'white'
              }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '1.5rem' }}>{tool.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{tool.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.4rem' }}>{tool.id} Logic Engine</p>
            </motion.div>
          ))}
        </aside>

        <main className="card" style={{ padding: '4rem', position: 'relative', minHeight: '650px' }}>
          <AnimatePresence mode="wait">
            {!activeAnalyzer ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '10rem 0' }}>
                 <Search size={64} color="#e5e7eb" style={{ margin: '0 auto 2rem' }} />
                 <h2 style={{ color: '#94a3b8' }}>Select an Analysis Protocol</h2>
              </motion.div>
            ) : !analysisResult && !isAnalyzing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem' }}><ScanSearch size={32} color="#3b82f6" /></div>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem' }}><FileText size={32} color="#ef4444" /></div>
                    <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '1rem' }}><Activity size={32} color="#10b981" /></div>
                 </div>
                 <h2 style={{ fontSize: '2.2rem' }}>Inject {activeAnalyzer} Data</h2>
                 <p style={{ color: 'var(--muted)', marginTop: '1rem', fontSize: '1.1rem' }}>Spectral sensors online. Supports PDF, DOCX, XLSX, and Images.</p>
                 <button className="primary" style={{ marginTop: '2.5rem', width: '100%' }}>BROWSE ALL FORMATS</button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" 
                  />
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '8rem 0' }}>
                 <BrainCircuit className="spinning" size={80} color="#3b82f6" />
                 <h2 style={{ marginTop: '3rem', fontSize: '2.5rem', fontWeight: 950 }}>{progress}%</h2>
                 <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>Decompiling Molecular Signals v7.2...</p>
                 <div style={{ width: '400px', height: '12px', background: '#f1f5f9', borderRadius: '6px', margin: '3rem auto', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progress}%` }} 
                      style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #d946ef)', backgroundSize: '200% auto' }} 
                    />
                 </div>
                 <p style={{ fontSize: '0.8rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>NEURAL AGENT PROCESSING SEQUENCE</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                      <h2 style={{ fontSize: '2.8rem', fontWeight: 950 }} className="glitter-text">{analysisResult.title || 'Analysis Complete'}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>{analysisResult.summary}</p>
                    </div>
                    <button className="secondary" onClick={() => setAnalysisResult(null)}>Scan New Asset</button>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                    {analysisResult.metrics?.map((m: any, i: number) => (
                      <div key={i} className="card" style={{ padding: '3rem', background: '#fff', boxShadow: '0 4px 25px rgba(0,0,0,0.03)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '1rem', fontWeight: 800 }}>{m.label}</p>
                            {m.status === 'Normal' ? <CheckCircle2 size={20} color="#22c55e" /> : <AlertCircle size={20} color="#ef4444" />}
                         </div>
                         <p style={{ fontSize: '3.5rem', fontWeight: 950, margin: '1rem 0' }}>
                            {m.value} <span style={{ fontSize: '1.4rem', color: '#3b82f6' }}>{m.unit}</span>
                         </p>
                         <span className="badge" style={{ background: m.status === 'Normal' ? '#dcfce7' : '#fee2e2', color: m.status === 'Normal' ? '#166534' : '#991b1b', border: 'none', padding: '0.6rem 1.25rem' }}>
                            {m.status}
                         </span>
                      </div>
                    ))}
                 </div>

                 {analysisResult.interpretation && (
                   <div className="card" style={{ marginTop: '3rem', background: '#020617', color: 'white', padding: '4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <BrainCircuit color="#3b82f6" size={32} />
                        <h3 style={{ color: '#3b82f6', fontSize: '1.8rem' }}>NEURAL INTERPRETATION ENGINE</h3>
                      </div>
                      <p style={{ fontSize: '1.2rem', lineHeight: 2, opacity: 0.9 }}>{analysisResult.interpretation}</p>
                   </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
