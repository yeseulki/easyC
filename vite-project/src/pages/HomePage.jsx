import { stages } from "../data/curriculum";

export default function HomePage({ onNavigate, progress }) {
  const done = progress.completedStages || [];
  const pct  = Math.round((done.length / stages.length) * 100);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column" }}>
      
      {/* Hero Tile (Light) */}
      <section style={{ 
        background: "var(--canvas)", 
        padding: "var(--spacing-section) var(--spacing-lg)",
        textAlign: "center",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}>
        <h1 className="hero-display" style={{ marginBottom: "var(--spacing-xs)", color: "var(--ink)" }}>
          easyC
        </h1>
        <p className="tagline" style={{ color: "var(--ink)", marginBottom: "var(--spacing-xl)", maxWidth: 700, opacity: 0.8 }}>
          The photography-first way to master C programming. <br/>
          Designed for simplicity. Engineered for depth.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-md)", marginBottom: 60 }}>
          <button className="button-primary" onClick={() => onNavigate("learn")}>
            Learn more
          </button>
          <button className="button-secondary" onClick={() => onNavigate("code")} style={{ border: "none", color: "var(--primary)" }}>
            Try it now &gt;
          </button>
        </div>
        
        {/* Mock Product Render */}
        <div style={{ 
          width: "110%", 
          maxWidth: 1000, 
          aspectRatio: "21/9", 
          background: "linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%)", 
          borderRadius: "var(--rounded-lg) var(--rounded-lg) 0 0",
          boxShadow: "rgba(0, 0, 0, 0.22) 0px 10px 40px -10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          position: "relative",
          bottom: -80
        }}>
          💻
        </div>
      </section>

      {/* Stats Tile (Dark) */}
      <section style={{ 
        background: "var(--surface-tile-1)", 
        color: "var(--body-on-dark)",
        padding: "var(--spacing-section) var(--spacing-lg)",
        textAlign: "center",
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h2 className="display-lg" style={{ marginBottom: 20 }}>Remarkably powerful.</h2>
          <p className="tagline" style={{ color: "var(--body-muted)", marginBottom: 60 }}>Everything you need to master the language of the machine.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 60 }}>
            {[
              { n: "5", l: "Curriculum Stages", c: "var(--primary-on-dark)" }, 
              { n: "15", l: "Detailed Lessons", c: "#2997ff" }, 
              { n: "5", l: "Real-world Projects", c: "#2997ff" }, 
              { n: "AI", l: "Dr.C Assistant", c: "#2997ff" }
            ].map(st => (
              <div key={st.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, fontWeight: 600, color: st.c, letterSpacing: "-0.02em" }}>{st.n}</div>
                <div style={{ fontSize: 17, color: "var(--body-on-dark)", fontWeight: 600, marginTop: 12 }}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stages Tile (Parchment) */}
      <section style={{ 
        background: "var(--canvas-parchment)", 
        padding: "var(--spacing-section) var(--spacing-lg)",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 1024, margin: "0 auto" }}>
          <h2 className="display-lg" style={{ marginBottom: 60 }}>Curriculum</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--spacing-lg)" }}>
            {stages.map((stage, i) => {
              const completed = done.includes(stage.id); 
              return (
                <div key={stage.id} style={{ 
                  background: "var(--canvas)", 
                  borderRadius: "var(--rounded-lg)", 
                  padding: "40px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 280,
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }} className="card-hover">
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 20 }}>{stage.emoji}</div>
                    <h3 className="body-strong" style={{ fontSize: 24, marginBottom: 8 }}>{stage.title}</h3>
                    <p style={{ fontSize: 17, color: "var(--ink-muted-80)", lineHeight: 1.4 }}>{stage.subtitle}</p>
                  </div>
                  <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button className="button-primary" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => onNavigate("learn", { stageIdx: i })}>
                      {completed ? "Review" : "Start"}
                    </button>
                    {completed && <span style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14 }}>✓ Completed</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: "var(--canvas-parchment)", 
        padding: "80px var(--spacing-lg)",
        borderTop: "1px solid var(--divider-soft)",
        color: "var(--ink-muted-48)",
        fontSize: 12
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ borderBottom: "1px solid var(--hairline)", paddingBottom: 20, marginBottom: 20 }}>
            <p style={{ lineHeight: 1.6 }}>
              1. AI Assistant requires an active internet connection. Results may vary based on query complexity. <br/>
              2. Curriculum stages are updated periodically to reflect modern C standards.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <p>Copyright © 2026 easyC Inc. All rights reserved.</p>
            <div style={{ display: "flex", gap: 20 }}>
              <span>Privacy Policy</span>
              <span style={{ borderLeft: "1px solid var(--ink-muted-48)", paddingLeft: 20 }}>Terms of Use</span>
              <span style={{ borderLeft: "1px solid var(--ink-muted-48)", paddingLeft: 20 }}>Legal</span>
              <span style={{ borderLeft: "1px solid var(--ink-muted-48)", paddingLeft: 20 }}>Site Map</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .card-hover:hover {
          transform: scale(1.02);
        }
      `}</style>

    </div>
  );
}
