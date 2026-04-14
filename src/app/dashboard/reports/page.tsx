"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, Droplets, Pill, RefreshCw, Search, BrainCircuit, ChevronLeft, 
  CheckCircle2, AlertCircle, FileText, ScanSearch, Zap
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
    if (!file || !activeAnalyzer) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Dynamic Route Mapping for Separate Agents
    const routeMap: any = {
      'Medical Report': '/api/analyze/medical',
      'Blood Test': '/api/analyze/blood',
      'Medication': '/api/analyze/medication'
    };

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const res = await fetch(routeMap[activeAnalyzer], { 
          method: "POST", 
          body: JSON.stringify({ image: base64String }) 
        });
        const data = await res.json();
        setAnalysisResult(data);
      } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button className="secondary" style={{ borderRadius: '50%', padding: '1rem', width: 'auto' }} onClick={() => router.push("/dashboard")}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <span className="badge">AI HEALTH ANALYSER</span>
          <h1 className="glitter-text" style={{ fontSize: '3.5rem', margin: 0 }}>Report Analysis</h1>
        </div>
      </header>

      {/* Responsive Grid Layout */}
      <div className="reports-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '3rem' }}>
        
        {/* Sidebar: Navigation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           {[
            { id: 'Medical Report', icon: <Stethoscope size={28} />, label: 'Medical Report', color: '#3b82f6' },
            { id: 'Blood Test', icon: <Droplets size={28} />, label: 'Blood Test', color: '#ef4444' },
            { id: 'Medication', icon: <Pill size={28} />, label: 'Medication', color: '#10b981' }
          ].map((tool) => (
            <motion.div 
              key={tool.id} whileHover={{ x: 10 }} className="card" 
              style={{ cursor: 'pointer', padding: '2rem', border: activeAnalyzer === tool.id ? '3px solid #3b82f6' : '1px solid var(--border)' }}
              onClick={() => { setActiveAnalyzer(tool.id); setAnalysisResult(null); }}
            >
              <div style={{ color: tool.color, marginBottom: '1.5rem' }}>{tool.icon}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{tool.label}</h3>
            </motion.div>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="card" style={{ padding: '3rem', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {!activeAnalyzer ? (
              <div style={{ textAlign: 'center', padding: '10vw 0' }}><Search size={64} color="#e5e7eb" /><h2 style={{ color: '#94a3b8', marginTop: '2rem' }}>Select a report type...</h2></div>
            ) : !analysisResult && !isAnalyzing ? (
              <div className="upload-zone" style={{ border: '2px dashed #cbd5e1', borderRadius: '2rem', padding: '5rem 1rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                 <ScanSearch size={64} color="#3b82f6" />
                 <h2 style={{ fontSize: '2.2rem', marginTop: '2rem', color: '#1e293b' }}>Upload {activeAnalyzer}</h2>
                 <p style={{ color: 'var(--muted)', marginTop: '1rem' }}>PDF, Images, Word, or Excel</p>
                 <button className="primary" style={{ margin: '2rem auto 0' }}>BROWSE FILES</button>
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
              </div>
            ) : isAnalyzing ? (
              <div style={{ textAlign: 'center', padding: '8rem 0' }}>
                 <BrainCircuit className="spinning" size={80} color="#3b82f6" />
                 <h2 style={{ fontSize: '3.5rem', fontWeight: 950, color: '#3b82f6', marginTop: '2rem' }}>{progress}%</h2>
                 <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '1rem' }}>Sourcing Agent Knowledge...</p>
                 <div style={{ width: '100%', maxWidth: '400px', height: '12px', background: '#f1f5f9', borderRadius: '6px', margin: '3rem auto', overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'var(--primary)' }} />
                 </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginBottom: '4rem' }}>
                    <div>
                      <h2 style={{ fontSize: '2.8rem', fontWeight: 950 }} className="glitter-text">{analysisResult.title || "Report Captured"}</h2>
                      <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>{analysisResult.summary}</p>
                    </div>
                    <button className="secondary" style={{ width: 'auto' }} onClick={() => setAnalysisResult(null)}>ANALISE NEW</button>
                 </div>

                 {/* Precision Metrics Grid */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    {analysisResult.metrics?.map((m: any, i: number) => (
                      <div key={i} className="card" style={{ padding: '2.5rem', background: '#f8fafc' }}>
                         <p style={{ color: 'var(--muted)', fontWeight: 900, fontSize: '0.85rem' }}>{m.label}</p>
                         <p style={{ fontSize: '3rem', fontWeight: 950, margin: '1rem 0', color: '#1e293b' }}>{m.value} <span style={{ fontSize: '1.2rem', color: '#3b82f6' }}>{m.unit}</span></p>
                         <span className="badge" style={{ background: m.status === 'Normal' ? '#dcfce7' : '#fee2e2', color: m.status === 'Normal' ? '#166534' : '#991b1b', border: 'none' }}>{m.status}</span>
                      </div>
                    ))}
                 </div>

                 {/* Insights Matrix */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
                    <div className="card" style={{ background: '#ecfdf5', borderColor: 'transparent' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          <CheckCircle2 size={24} color="#059669" /> <h3 style={{ color: '#059669', fontSize: '1.4rem' }}>Good Points</h3>
                       </div>
                       <ul style={{ paddingLeft: '1.25rem', color: '#065f46' }}>{analysisResult.positives?.map((p: string, i: number) => <li key={i} style={{ marginBottom: '1rem' }}>{p}</li>)}</ul>
                    </div>
                    
                    <div className="card" style={{ background: '#fffbeb', borderColor: 'transparent' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          <Zap size={24} color="#d97706" /> <h3 style={{ color: '#d97706', fontSize: '1.4rem' }}>To Improve</h3>
                       </div>
                       <ul style={{ paddingLeft: '1.25rem', color: '#92400e' }}>{analysisResult.improvements?.map((p: string, i: number) => <li key={i} style={{ marginBottom: '1rem' }}>{p}</li>)}</ul>
                    </div>
                    
                    <div className="card" style={{ background: '#fef2f2', borderColor: 'transparent' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          <AlertCircle size={24} color="#dc2626" /> <h3 style={{ color: '#dc2626', fontSize: '1.4rem' }}>Risks</h3>
                       </div>
                       <ul style={{ paddingLeft: '1.25rem', color: '#991b1b' }}>{analysisResult.risks?.map((p: string, i: number) => <li key={i} style={{ marginBottom: '1rem' }}>{p}</li>)}</ul>
                    </div>
                 </div>

                 {/* Deep Analysis */}
                 <div className="card" style={{ background: '#020617', color: 'white', padding: '4rem' }}>
                    <h3 style={{ color: '#3b82f6', marginBottom: '2.5rem', fontSize: '2rem', fontWeight: 950 }}>AI Interpretation</h3>
                    <p style={{ fontSize: '1.25rem', lineHeight: 2, opacity: 0.9 }}>{analysisResult.interpretation}</p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
