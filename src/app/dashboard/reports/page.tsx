"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Droplets, 
  Pill, 
  RefreshCw, 
  X, 
  ScanSearch, 
  BrainCircuit, 
  ChevronLeft, 
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [activeAnalyzer, setActiveAnalyzer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        {/* Sidebar: Analyzer Types */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {[
            { id: 'Medical Report', icon: <Stethoscope size={28} />, label: 'Medical Dossier', color: '#3b82f6' },
            { id: 'Blood Test', icon: <Droplets size={28} />, label: 'Blood Matrix', color: '#ef4444' },
            { id: 'Medication', icon: <Pill size={28} />, label: 'Chemical Ledger', color: '#10b981' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} 
              whileHover={{ x: 10 }}
              className="card" 
              style={{ 
                cursor: 'pointer', 
                padding: '2rem', 
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

        {/* Main: Analysis Console */}
        <main className="card" style={{ padding: '4rem', position: 'relative', minHeight: '600px' }}>
          {isAnalyzing && <div className="scan-line" />}
          
          <AnimatePresence mode="wait">
            {!activeAnalyzer ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '10rem 0' }}>
                 <Search size={64} color="#e5e7eb" style={{ margin: '0 auto 2rem' }} />
                 <h2 style={{ color: '#94a3b8' }}>Select an Analysis Protocol</h2>
              </motion.div>
            ) : !analysisResult && !isAnalyzing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                 <ScanSearch size={64} color="#3b82f6" style={{ marginBottom: '2rem' }} />
                 <h2 style={{ fontSize: '2rem' }}>Inject {activeAnalyzer} Data</h2>
                 <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>Spectral sensors online. Awaiting document input.</p>
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '10rem 0' }}>
                 <BrainCircuit className="spinning" size={80} color="#3b82f6" />
                 <h2 style={{ marginTop: '3rem', fontSize: '2rem' }}>Decompiling Molecular Data...</h2>
                 <div style={{ width: '300px', height: '8px', background: '#f1f5f9', borderRadius: '4px', margin: '2rem auto', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5, repeat: Infinity }} style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #d946ef)' }} />
                 </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                      <h2 style={{ fontSize: '2.5rem' }}>{analysisResult.title || 'Analysis Complete'}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>{analysisResult.summary}</p>
                    </div>
                    <button className="secondary" onClick={() => setAnalysisResult(null)}>Scan New</button>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {analysisResult.metrics?.map((m: any, i: number) => (
                      <div key={i} className="card" style={{ padding: '2.5rem', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 800 }}>{m.label}</p>
                            {m.status === 'Normal' ? <CheckCircle2 size={16} color="#22c55e" /> : <AlertCircle size={16} color="#ef4444" />}
                         </div>
                         <p style={{ fontSize: '3rem', fontWeight: 950, margin: '1rem 0' }}>
                            {m.value} <span style={{ fontSize: '1.2rem', color: '#3b82f6' }}>{m.unit}</span>
                         </p>
                         <span className="badge" style={{ background: m.status === 'Normal' ? '#dcfce7' : '#fee2e2', color: m.status === 'Normal' ? '#166534' : '#991b1b', border: 'none' }}>
                            {m.status}
                         </span>
                      </div>
                    ))}
                 </div>

                 <div className="card" style={{ marginTop: '3rem', background: '#020617', color: 'white' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '1.5rem' }}>NEURAL INTERPRETATION</h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.9 }}>{analysisResult.interpretation}</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
