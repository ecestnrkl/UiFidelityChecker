"use client";

import { useState, useMemo, useCallback } from "react";
import { ComparisonResult, VIEWPORT_PRESETS } from "@/lib/types";
import { generateMarkdownReport, generateJSONReport } from "@/lib/reportGenerator";
import TicketBuilder from "./components/TicketBuilder";

export default function Home() {
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [implementationImage, setImplementationImage] = useState<string | null>(null);
  const [implementationMode, setImplementationMode] = useState<"upload" | "url">("upload");
  const [implementationUrl, setImplementationUrl] = useState("");
  const [viewport, setViewport] = useState<keyof typeof VIEWPORT_PRESETS>("desktop");
  const [screenName, setScreenName] = useState("");
  const [platform, setPlatform] = useState<"" | "web" | "mobile">("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [selectedMismatches, setSelectedMismatches] = useState<string[]>([]);

  const handleCompare = async () => {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      let implImage = implementationImage;

      if (implementationMode === "url") {
        if (!implementationUrl) {
          throw new Error("Please enter a URL");
        }

        const screenshotRes = await fetch("/api/screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: implementationUrl, viewport }),
        });

        if (!screenshotRes.ok) {
          const errorData = await screenshotRes.json();
          throw new Error(errorData.error || "Failed to capture screenshot");
        }

        const screenshotData = await screenshotRes.json();
        implImage = screenshotData.image;
        setImplementationImage(implImage);
      }

      if (!designImage || !implImage) {
        throw new Error("Please upload both images");
      }

      const compareRes = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designImage,
          implementationImage: implImage,
          screenName: screenName || undefined,
          platform: platform || undefined,
        }),
      });

      if (!compareRes.ok) {
        const errorData = await compareRes.json();
        throw new Error(errorData.error || "Failed to compare images");
      }

      const compareData: ComparisonResult = await compareRes.json();
      setResult(compareData);
      setSelectedMismatches(compareData.mismatches.map(m => m.id));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = useCallback(() => {
    if (!result) return;
    const report = generateMarkdownReport(result, selectedMismatches);
    navigator.clipboard.writeText(report.content);
    // Better visual feedback - could be replaced with toast notification
    const originalText = document.activeElement?.textContent;
    if (document.activeElement) {
      (document.activeElement as HTMLElement).textContent = '✓ COPIED!';
      setTimeout(() => {
        if (document.activeElement && originalText) {
          (document.activeElement as HTMLElement).textContent = originalText;
        }
      }, 2000);
    }
  }, [result, selectedMismatches]);

  const handleDownloadJSON = useCallback(() => {
    if (!result) return;
    const report = generateJSONReport(result);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ui-fidelity-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const toggleMismatch = useCallback((id: string) => {
    setSelectedMismatches(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleReset = useCallback(() => {
    setDesignImage(null);
    setImplementationImage(null);
    setImplementationMode("upload");
    setImplementationUrl("");
    setViewport("desktop");
    setScreenName("");
    setPlatform("");
    setLoading(false);
    setError(null);
    setResult(null);
    setSelectedMismatches([]);
  }, []);

  return (
    <main 
      className="min-h-screen w-full"
      style={{ 
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        padding: '48px 24px'
      }}
    >
      <div 
        className="mx-auto"
        style={{ 
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}
      >
        
        {/* Hero + Score */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <h1 
                className="text-6xl lg:text-7xl font-black leading-tight"
                style={{ fontFamily: "'Orbitron', sans-serif", flex: 1 }}
              >
                <span className="glow-text" style={{ color: 'var(--accent-neon)' }}>UI</span>
                <br />
                <span className="text-white">FIDELITY</span>
              </h1>
              
              {result && (
                <button
                  onClick={handleReset}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'transparent',
                    border: '2px solid var(--accent-cyan)',
                    borderRadius: '50%',
                    color: 'var(--accent-cyan)',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-cyan)';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.transform = 'rotate(180deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--accent-cyan)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                  title="Reset and start new comparison"
                  aria-label="Reset comparison"
                >
                  ↻
                </button>
              )}
            </div>
            <div 
              style={{ 
                height: '6px', 
                width: '120px', 
                background: 'linear-gradient(to right, var(--accent-neon), var(--accent-cyan))',
                marginBottom: '24px'
              }}
            />
            <p 
              className="text-lg"
              style={{ 
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                lineHeight: '1.7',
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              Pixel-perfect visual regression analysis.
              <br />
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Find every mismatch.</span>
            </p>
          </div>
          
          <div 
            className="card-terminal"
            style={{ 
              flex: '0 1 300px',
              padding: '32px 24px',
              borderRadius: '16px',
              borderLeft: '4px solid var(--accent-neon)'
            }}
          >
            <div 
              className="glow-text"
              style={{ 
                fontSize: '64px',
                fontWeight: 900,
                marginBottom: '12px',
                fontFamily: "'Orbitron', sans-serif",
                color: 'var(--accent-neon)'
              }}
            >
              {result ? `${result.similarity}%` : '---'}
            </div>
            <div 
              style={{ 
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: 'var(--text-secondary)',
                fontWeight: 700
              }}
            >
              Similarity Score
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          
          {/* Design Upload */}
          <div 
            className="card-terminal glow-neon"
            style={{ 
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--accent-neon)',
                  animation: 'pulse 2s infinite'
                }}
              />
              <h2 
                style={{ 
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  color: 'var(--accent-neon)',
                  fontFamily: "'Orbitron', sans-serif"
                }}
              >
                Design Mockup
              </h2>
            </div>
            
            <input
              type="file"
              accept="image/*"
              id="design-upload"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setDesignImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              aria-label="Upload design mockup image"
            />
            <label 
              htmlFor="design-upload"
              className="upload-zone"
              style={{ 
                minHeight: '320px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '24px'
              }}
            >
              {designImage ? (
                <img 
                  src={designImage} 
                  alt="Design" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '280px', 
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }} 
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '72px', marginBottom: '16px', color: 'var(--accent-neon)' }}>↑</div>
                  <p style={{ 
                    fontSize: '13px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '2px',
                    color: 'var(--text-secondary)',
                    fontWeight: 700
                  }}>
                    Drop or Click
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Implementation */}
          <div 
            className="card-terminal glow-cyan"
            style={{ 
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent-cyan)',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <h2 
                  style={{ 
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    fontFamily: "'Orbitron', sans-serif"
                  }}
                >
                  Implementation
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setImplementationMode("upload")}
                  style={{
                    padding: '8px 16px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: implementationMode === "upload" ? 'none' : '2px solid var(--border)',
                    backgroundColor: implementationMode === "upload" ? 'var(--accent-cyan)' : 'transparent',
                    color: implementationMode === "upload" ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Orbitron', sans-serif"
                  }}
                >
                  Upload
                </button>
                <button
                  onClick={() => setImplementationMode("url")}
                  style={{
                    padding: '8px 16px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: implementationMode === "url" ? 'none' : '2px solid var(--border)',
                    backgroundColor: implementationMode === "url" ? 'var(--accent-cyan)' : 'transparent',
                    color: implementationMode === "url" ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Orbitron', sans-serif"
                  }}
                >
                  URL
                </button>
              </div>
            </div>

            {implementationMode === "upload" ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id="impl-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setImplementationImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  aria-label="Upload implementation screenshot"
                />
                <label 
                  htmlFor="impl-upload"
                  className="upload-zone"
                  style={{ 
                    minHeight: '320px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: '24px'
                  }}
                >
                  {implementationImage ? (
                    <img 
                      src={implementationImage} 
                      alt="Implementation" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '280px', 
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }} 
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '72px', marginBottom: '16px', color: 'var(--accent-cyan)' }}>↑</div>
                      <p style={{ 
                        fontSize: '13px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px',
                        color: 'var(--text-secondary)',
                        fontWeight: 700
                      }}>
                        Drop or Click
                      </p>
                    </div>
                  )}
                </label>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={implementationUrl}
                  onChange={(e) => setImplementationUrl(e.target.value)}
                  className="input-terminal"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '8px'
                  }}
                />
                <select 
                  value={viewport}
                  onChange={(e) => setViewport(e.target.value as keyof typeof VIEWPORT_PRESETS)}
                  className="input-terminal"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '8px'
                  }}
                >
                  {Object.entries(VIEWPORT_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Metadata + Button */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                placeholder="Screen name (optional)"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                className="input-terminal"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  borderRadius: '8px'
                }}
              />
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value as "" | "web" | "mobile")}
                className="input-terminal"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  borderRadius: '8px'
                }}
              >
                <option value="">Platform (optional)</option>
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>

            {error && (
              <div 
                style={{ 
                  borderLeft: '4px solid #ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '16px',
                  borderRadius: '8px'
                }}
              >
                <p style={{ 
                  color: '#f87171', 
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  ⚠ {error}
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={handleCompare}
            disabled={loading || !designImage}
            className="btn-neon"
            style={{
              width: '100%',
              minHeight: '56px',
              padding: '16px 32px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              borderRadius: '8px',
              fontFamily: "'Orbitron', sans-serif",
              opacity: (loading || !designImage) ? 0.5 : 1,
              cursor: (loading || !designImage) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            aria-label="Start comparison analysis"
          >
            {loading && (
              <svg 
                style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
            )}
            {loading ? "ANALYZING..." : "COMPARE"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div className="card-terminal" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  fontWeight: 700
                }}>Design</div>
                <img src={designImage!} alt="Design" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              
              <div className="card-terminal" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  fontWeight: 700
                }}>Implementation</div>
                <img src={implementationImage!} alt="Implementation" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              
              <div className="card-terminal glow-neon" style={{ padding: '20px', borderRadius: '12px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px',
                  color: 'var(--accent-neon)',
                  marginBottom: '12px',
                  fontWeight: 700
                }}>Diff Analysis</div>
                <img src={result.diffImageUrl} alt="Diff" style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--accent-neon)' }} />
              </div>
            </div>

            {result.mismatches.length > 0 ? (
              <div className="card-terminal" style={{ padding: '32px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: 900, fontFamily: "'Orbitron', sans-serif" }}>
                    <span style={{ color: 'var(--accent-neon)' }}>{result.mismatches.length}</span> MISMATCHES
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleCopyMarkdown}
                      disabled={selectedMismatches.length === 0}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--accent-neon)',
                        color: '#000',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: selectedMismatches.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: selectedMismatches.length === 0 ? 0.3 : 1,
                        fontFamily: "'Orbitron', sans-serif"
                      }}
                    >
                      COPY MD ({selectedMismatches.length})
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      style={{
                        padding: '12px 24px',
                        border: '2px solid var(--accent-cyan)',
                        backgroundColor: 'transparent',
                        color: 'var(--accent-cyan)',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontFamily: "'Orbitron', sans-serif"
                      }}
                    >
                      JSON ↓
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {result.mismatches.map((mismatch) => (
                    <div key={mismatch.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedMismatches.includes(mismatch.id)}
                          onChange={() => toggleMismatch(mismatch.id)}
                          style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: 'var(--accent-neon)', cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '1.5px',
                              fontWeight: 700,
                              borderRadius: '6px',
                              ...(mismatch.priority === "high" ? {
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.5)'
                              } : mismatch.priority === "medium" ? {
                                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                                color: '#fbbf24',
                                border: '1px solid rgba(251, 191, 36, 0.5)'
                              } : {
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.5)'
                              })
                            }}>
                              {mismatch.priority}
                            </span>
                            <span style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '1.5px',
                              backgroundColor: 'rgba(0, 255, 136, 0.1)',
                              color: 'var(--accent-neon)',
                              border: '1px solid rgba(0, 255, 136, 0.3)',
                              borderRadius: '6px'
                            }}>
                              {mismatch.category}
                            </span>
                            <h4 style={{ fontWeight: 700, fontSize: '15px', fontFamily: "'Orbitron', sans-serif" }}>
                              {mismatch.title}
                            </h4>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.6' }}>
                            {mismatch.explanation}
                          </p>
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <strong style={{ color: 'var(--accent-cyan)' }}>Fix:</strong> {mismatch.suggestedFix}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.5, fontFamily: "'JetBrains Mono', monospace" }}>
                            [{mismatch.bbox.x}, {mismatch.bbox.y}] {mismatch.bbox.width}×{mismatch.bbox.height}px
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ticket Builder */}
                <TicketBuilder
                  result={result}
                  selectedMismatches={selectedMismatches}
                />
              </div>
            ) : (
              <div className="card-terminal glow-neon" style={{ padding: '64px 32px', textAlign: 'center', borderRadius: '16px' }}>
                <div style={{ fontSize: '72px', marginBottom: '24px' }}>✓</div>
                <h3 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '12px', fontFamily: "'Orbitron', sans-serif", color: 'var(--accent-neon)' }}>
                  PERFECT MATCH
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No significant differences detected</p>
              </div>
            )}

            {/* Reset Button */}
            <div style={{ marginTop: '48px', textAlign: 'center' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '16px 48px',
                  backgroundColor: 'transparent',
                  border: '2px solid var(--accent-neon)',
                  color: 'var(--accent-neon)',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Orbitron', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-neon)';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--accent-neon)';
                }}
                aria-label="Reset and start new comparison"
              >
                ↻ NEW COMPARISON
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
