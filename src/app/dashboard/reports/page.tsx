"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, Droplets, Pill, RefreshCw, Search, BrainCircuit, ChevronLeft, 
  CheckCircle2, AlertCircle, FileText, ScanSearch, X, Zap, Target, ShieldCheck, Activity
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
          if (prev >= 98) return prev;
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 250);
    } else {
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
      } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
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
          <span className="badge">AGENT_7_SYSTEMS</span>
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
              key={tool.id} whileHover={{ x: 10 }} className="card" 
              style={{ cursor: 'pointer', padding: '2rem', border: activeAnalyzer === tool.id ? '3px solid #3b82f6' : '1px solid var(--border)' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '1.5rem' }}>{tool.icon}</div>
              <h3 style={{ fontSize: '1.4rem' }}>{tool.label}</h3>
            </motion.div>
          ))}
        </aside>

        <main className="card" style={{ padding: '4rem' }}>
          <AnimatePresence mode="wait">
            {!activeAnalyzer ? (
              <div style={{ textAlign: 'center', padding: '8rem 0' }}><Search size={64} color="#e5e7eb" /><h2 style={{ color: '#94a3b8', marginTop: '2rem' }}>Awaiting Protocol...</h2></div>
            ) : !analysisResult && !isAnalyzing ? (
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                 <ScanSearch size={64} color="#3b82f6" />
                 <h2 style={{ fontSize: '2.5rem', marginTop: '2rem' }}>Scan {activeAnalyzer}</h2>
                 <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>Support for Image, PDF, Word, Excel</p>
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
              </div>
            ) : isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '8rem 0' }}>
                 <BrainCircuit className="spinning" size={80} color="#3b82f6" />
                 <h2 style={{ fontSize: '4rem', fontWeight: 950, color: '#3b82f6' }}>{progress}%</h2>
                 <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '1rem' }}>Synthesizing Health Data...</p>
                 <div style={{ width: '400px', height: '12px', background: '#f1f5f9', borderRadius: '6px', margin: '3rem auto', overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
                 </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem' }}>
                    <div>
                      <h2 style={{ fontSize: '3rem' }} className="glitter-text">{analysisResult.title || "Scan Results"}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>{analysisResult.summary}</p>
                    </div>
                    <button className="secondary" onClick={() => setAnalysisResult(null)}>Scan New Asset</button>
                 </div>

                 {/* Metrics Section */}
                 {analysisResult.metrics?.length > 0 && (
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                      {analysisResult.metrics.map((m: any, i: number) => (
                        <div key={i} className="card" style={{ padding: '2.5rem', background: '#f8fafc' }}>
                           <p style={{ color: 'var(--muted)', fontWeight: 800 }}>{m.label}</p>
                           <p style={{ fontSize: '3rem', fontWeight: 950, margin: '1rem 0' }}>{m.value} <span style={{ fontSize: '1.2rem', color: '#3b82f6' }}>{m.unit}</span></p>
                           <span className="badge" style={{ background: m.status === 'Normal' ? '#dcfce7' : '#fee2e2', color: m.status === 'Normal' ? '#166534' : '#991b1b', border: 'none' }}>{m.status}</span>
                        </div>
                      ))}
                   </div>
                 )}

                 {/* New Insights Sections */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="card" style={{ background: '#ecfdf5', borderColor: '#34d399' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#059669' }}>
                          <CheckCircle2 size={24} /> <h3 style={{ color: '#059669' }}>Good Points</h3>
                       </div>
                       <ul style={{ paddingLeft: '1.25rem' }}>
                          {analysisResult.positives?.map((p: string, i: number) => <li key={i} style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>{p}</li>)}
                       </ul>
                    </div>

                    <div className="card" style={{ background: '#fffbeb', borderColor: '#fbbf24' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#d97706' }}>
                          <Zap size={24} /> <h3 style={{ color: '#d97706' }}>To Improve</h3>
                       </div>
                       <ul style={{ paddingLeft: '1.25rem' }}>
                          {analysisResult.improvements?.map((p: string, i: number) => <li key={i} style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>{p}</li>)}
                       </ul>
                    </div>

                    <div className="card" style={{ background: '#fef2f2', borderColor: '#f87171' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#dc2626' }}>
                          <AlertCircle size={24} /> <h3 style={{ color: '#dc2626' }}>Safety Risks</h3>
                       </div>
                       <ul style={{ paddingLeft: '1.25rem' }}>
                          {analysisResult.risks?.map((p: string, i: number) => <li key={i} style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>{p}</li>)}
                       </ul>
                    </div>
                 </div>

                 <div className="card" style={{ background: '#020617', color: 'white', padding: '4rem' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '2rem', fontSize: '1.8rem' }}>CLINICAL INTERPRETATION</h3>
                    <p style={{ fontSize: '1.2rem', lineHeight: 2, opacity: 0.9 }}>{analysisResult.interpretation}</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
