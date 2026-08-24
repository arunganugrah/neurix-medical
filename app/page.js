"use client";

import { useEffect, useState } from "react";

const C = {
  navy: "#0B2A4A", navyDeep: "#081E38", gold: "#D9952F", goldSoft: "#E8B04B",
  paper: "#F7F8FA", ink: "#1C2430", inkSoft: "#5B6B7A", line: "#E4DFD2", card: "#FFFFFF",
};
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const sans = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };

function Logo({ size = 34 }) {
  return (
    <img 
      src="/logo-neurix.svg" 
      alt="Neurix Medical" 
      width={size} 
      height={size} 
      style={{ objectFit: "contain" }} 
    />
  );
}

/* Ilustrasi dekoratif (neuron abstrak) menggantikan foto asli */
function NeuronArt() {
  return (
    <svg viewBox="0 0 400 320" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#173F66" />
          <stop offset="100%" stopColor="#081E38" />
        </radialGradient>
      </defs>
      <rect width="400" height="320" rx="24" fill="url(#glow)" />
      {[[80,60],[220,40],[320,110],[60,180],[260,220],[150,260],[340,240]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?2.5:1.6} fill="#E8B04B" opacity={0.8} />
      ))}
      <g stroke="#E8B04B" strokeWidth="1" opacity="0.35">
        <line x1="80" y1="60" x2="220" y2="40" />
        <line x1="220" y1="40" x2="320" y2="110" />
        <line x1="80" y1="60" x2="60" y2="180" />
        <line x1="60" y1="180" x2="150" y2="260" />
        <line x1="150" y1="260" x2="260" y2="220" />
        <line x1="260" y1="220" x2="340" y2="240" />
        <line x1="220" y1="40" x2="260" y2="220" />
      </g>
      <g transform="translate(150,120)">
        <ellipse cx="50" cy="60" rx="46" ry="42" fill="#0B2A4A" stroke="#E8B04B" strokeWidth="1.5" opacity="0.9" />
        <path d="M20 40 Q10 20 30 10 M80 40 Q90 20 70 10 M15 70 Q0 80 10 100 M85 70 Q100 80 90 100 M50 8 Q50 -10 50 -20 M50 112 Q50 130 50 140"
          stroke="#E8B04B" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const NAV = ["Home", "Programs", "Academic Support", "Membership", "Resources", "About Us", "Contact"];
const FEATURES = [
  { icon: "👥", label: "Small Class", sub: "Max. 10 Students" },
  { icon: "🛡️", label: "Evidence-Based", sub: "Learning" },
  { icon: "🎓", label: "Academic & Research", sub: "Support" },
  { icon: "🩺", label: "From Pre-klinik to", sub: "Internship" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ ...sans, background: C.paper, color: C.ink, minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.paper, position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo />
            <div>
              <div style={{ ...serif, color: C.navy, fontWeight: 700, fontSize: 18, letterSpacing: "-.01em", lineHeight: 1 }}>NEURIX</div>
              <div style={{ color: C.gold, fontSize: 10, letterSpacing: ".18em", fontWeight: 600 }}>MEDICAL</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 22 }} className="nx-nav-desktop">
            {NAV.map((n) => (
              <a key={n} href={`#${n.toLowerCase().replace(/\s/g, "-")}`} style={{ color: C.ink, fontSize: 13.5, fontWeight: 600, textDecoration: "none", letterSpacing: ".02em" }}>{n.toUpperCase()}</a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <a href="/login" style={{ border: `1.5px solid ${C.navy}`, color: C.navy, borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>LOGIN</a>
            <a href="/login" style={{ background: C.gold, color: "#1C2430", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>REGISTER</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }} className="nx-hero-grid">
          <div className="nx-page">
            <h1 style={{ ...serif, fontSize: "clamp(38px,6vw,58px)", lineHeight: 1.05, fontWeight: 700, margin: 0, letterSpacing: "-.02em" }}>
              <span style={{ color: C.navy }}>Learn.</span><br />
              <span style={{ color: C.navy }}>Understand.</span><br />
              <span style={{ color: C.gold }}>Heal.</span>
            </h1>
            <p style={{ color: C.inkSoft, fontSize: 16, fontWeight: 600, margin: "18px 0 8px" }}>Your Medical Learning &amp; Academic Partner.</p>
            <p style={{ color: C.inkSoft, fontSize: 15, lineHeight: 1.7, maxWidth: 460 }}>
              Neurix Medical hadir untuk membantu mahasiswa kedokteran belajar lebih terarah, sistematis, dan evidence-based.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
              <a href="#programs" style={{ background: C.navy, color: "#fff", padding: "13px 22px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>EXPLORE CLASSES →</a>
              <a href="/login" style={{ border: `1.5px solid ${C.gold}`, color: C.navy, padding: "13px 22px", borderRadius: 12, fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}>JOIN NEURIX</a>
            </div>
            <div className="nx-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginTop: 40 }}>
              {FEATURES.map((f) => (
                <div key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: C.inkSoft }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

                    <div className="nx-pop" style={{ position: "relative" }}>
            <div style={{
              borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 70px -30px rgba(11,42,74,.4)",
              background: "radial-gradient(circle at 50% 35%, #173F66 0%, #081E38 100%)",
              aspectRatio: "4 / 3.2", display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
            }}>
              <img
                src="/logo-neurix.svg"
                alt="Neurix Medical Logo"
                style={{ width: "45%", maxWidth: 180, objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </section>
      

      {/* PROGRAMS SECTION */}
      <section id="programs" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", background: C.paper }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 32, textAlign: "center", marginBottom: 40 }}>Our Programs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <h3 style={{ ...serif, color: C.navy, margin: "0 0 8px" }}>Pre-Klinik</h3>
            <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Materi dasar anatomi, fisiologi, biokimia dan keterampilan klinis dasar.</p>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
            <h3 style={{ ...serif, color: C.navy, margin: "0 0 8px" }}>Klinik</h3>
            <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Topik kedokteran klinis, case discussions, dan persiapan uji kompetensi.</p>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
            <h3 style={{ ...serif, color: C.navy, margin: "0 0 8px" }}>Magang & Riset</h3>
            <p style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.6 }}>Persiapan internship, research writing, dan publikasi ilmiah.</p>
          </div>
        </div>
      </section>

      {/* ACADEMIC SUPPORT SECTION */}
      <section id="academic-support" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", background: C.card }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 32, textAlign: "center", marginBottom: 40 }}>Academic Support</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <h3 style={{ ...serif, color: C.gold, fontSize: 20, marginBottom: 16 }}>Kami Menyediakan:</h3>
            {["Video pembelajaran interaktif", "Quiz dan Try Out", "Materials & Resources", "1-on-1 Consultation", "Study Groups", "Progress Tracking"].map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                <span style={{ fontSize: 20, color: C.gold }}>✓</span>
                <span style={{ fontSize: 15, color: C.ink }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.navy, borderRadius: 18, padding: 40, color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <p style={{ fontSize: 16, lineHeight: 1.8, margin: 0 }}>Fokus kami adalah membantu kamu menguasai topik dengan pemahaman mendalam, bukan hanya menghafal.</p>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP SECTION */}
      <section id="membership" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", background: C.paper }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 32, textAlign: "center", marginBottom: 40 }}>Membership Tiers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {[
            { tier: "Gold Member", price: "Rp xxxK", features: ["Akses 50+ topics", "Quiz unlimited", "Consultation 2x/bulan"] },
            { tier: "Silver Member", price: "Rp xxxK", features: ["Akses all topics", "Quiz unlimited", "Consultation 4x/bulan", "Priority support"] },
            { tier: "Platinum Member", price: "Rp xxxK", features: ["Akses all + premium", "Group sessions", "Consultation unlimited", "VIP support", "Research guidance"] }
          ].map((m) => (
            <div key={m.tier} style={{ background: C.card, border: `2px solid ${C.gold}`, borderRadius: 18, padding: 24, textAlign: "center" }}>
              <h3 style={{ ...serif, color: C.navy, margin: "0 0 8px" }}>{m.tier}</h3>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, marginBottom: 20 }}>{m.price}</div>
              <ul style={{ textAlign: "left", fontSize: 14, color: C.ink, listStyle: "none", padding: 0, marginBottom: 20 }}>
                {m.features.map((f) => <li key={f} style={{ marginBottom: 8 }}>✓ {f}</li>)}
              </ul>
              <button style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer" }}>Pilih Paket</button>
            </div>
          ))}
        </div>
      </section>

      {/* RESOURCES SECTION */}
      <section id="resources" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", background: C.card }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 32, textAlign: "center", marginBottom: 40 }}>Resources</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { title: "10K+ E-Books", desc: "Medical textbooks & references" },
            { title: "Video Library", desc: "1000+ hours of content" },
            { title: "Study Guides", desc: "Ringkasan per topik" },
            { title: "Case Studies", desc: "Real clinical scenarios" },
            { title: "Journal Articles", desc: "Latest research" },
            { title: "Tools & Calculators", desc: "Medical calculators online" }
          ].map((r) => (
            <div key={r.title} style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
              <h4 style={{ color: C.navy, margin: "0 0 6px" }}>{r.title}</h4>
              <p style={{ color: C.inkSoft, fontSize: 13, margin: 0 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-us" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", background: C.paper }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 32, textAlign: "center", marginBottom: 20 }}>Tentang Neurix Medical</h2>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: C.inkSoft, fontSize: 16, lineHeight: 1.8 }}>
            Neurix Medical adalah platform pembelajaran yang didirikan oleh dokter dan pendidik untuk membantu mahasiswa kedokteran belajar secara efektif, sistematis, dan berbasis bukti ilmiah.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {[
            { label: "Founded", value: "2026" },
            { label: "Students", value: "50+" },
            { label: "Topics", value: "Terlengkap" },
            { label: "Mentors", value: "Top Quality" }
          ].map((stat) => (
            <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ color: C.inkSoft, fontSize: 13 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", background: C.card }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 32, textAlign: "center", marginBottom: 40 }}>Hubungi Kami</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, maxWidth: 900, margin: "0 auto" }}>
          <div>
            <h3 style={{ ...serif, color: C.gold, marginBottom: 20 }}>Contact Info</h3>
            {[
              { icon: "📧", label: "Email", value: "neurixmedical@gmail.com" },
              { icon: "📱", label: "WhatsApp", value: "+62 858 2127 6673" },
              { icon: "📍", label: "Location", value: "Makassar, Indonesia" }
            ].map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.navy }}>{c.label}</div>
                  <div style={{ color: C.inkSoft }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 style={{ ...serif, color: C.gold, marginBottom: 20 }}>Send Message</h3>
            <input type="text" placeholder="Your name" style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.line}` }} />
            <input type="email" placeholder="Your email" style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.line}` }} />
            <textarea placeholder="Your message" rows={4} style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: `1px solid ${C.line}`, fontFamily: "inherit" }} />
            <button style={{ width: "100%", background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer" }}>Kirim Pesan</button>
          </div>
        </div>
      </section>

      {/* Strip navy bawah hero, transisi ke konten lain */}
      <div style={{ background: C.navy, height: 64, borderRadius: "40px 40px 0 0", marginTop: 24 }} />

      <footer style={{ background: C.navy, color: "#fff", padding: "0 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p style={{ color: C.gold, fontWeight: 700, fontSize: 13, letterSpacing: ".08em", margin: "0 0 18px" }}>MENGAPA NEURIX MEDICAL?</p>
          <div className="nx-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 18 }}>
            {["Small Class · Max. 10 Students", "Evidence-Based Learning", "Academic & Research Support", "Continuous Learning from Pre-klinik to Internship", "Learning & Consultation Support", "10K+ Medical E-Books & Resources"].map((t) => (
              <div key={t} style={{ fontSize: 13, opacity: .85, lineHeight: 1.5 }}>{t}</div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}