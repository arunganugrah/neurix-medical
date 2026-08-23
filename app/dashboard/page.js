"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* Neurix Medical — Dashboard Murid
   Struktur data Firestore yang dipakai:
   - categories:   { id, name, emoji }
   - classes:      { id, title, categoryId, date, time, capacity, confirmed, status }
   - materials:    { id, title, categoryId, fileUrl, size }
   - videos:       { id, title, categoryId, duration, instructor }
   - quizzes:      { id, title, categoryId, items:[{question,options,answer,discussion}] }
   - announcements:{ id, title, date, tag }
*/

const C = {
  navy: "#0B2A4A", navyDeep: "#081E38", gold: "#D9952F", goldSoft: "#E8B04B",
  paper: "#F6F1E7", ink: "#1C2430", inkSoft: "#5B6B7A", line: "#E7E2D6", card: "#FFFFFF",
  good: "#2C7A55", bad: "#B23A2E",
};
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const sans = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };

const NAV = [
  { key: "home", icon: "🏠", label: "Dashboard" },
  { key: "classes", icon: "📚", label: "My Classes" },
  { key: "materials", icon: "📁", label: "Materials" },
  { key: "videos", icon: "▶️", label: "Video / Recordings" },
  { key: "quiz", icon: "📝", label: "Quiz & Try Out" },
  { key: "assignments", icon: "🖊️", label: "Assignments" },
  { key: "report", icon: "📄", label: "Raport" },
  { key: "progress", icon: "📈", label: "Progress" },
  { key: "consultation", icon: "💬", label: "Consultation" },
  { key: "calendar", icon: "📅", label: "Calendar" },
  { key: "messages", icon: "✉️", label: "Messages" },
  { key: "profile", icon: "👤", label: "Profile" },
  { key: "settings", icon: "⚙️", label: "Settings" },
];
function Watermark({ text }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 5,
      display: "flex", flexWrap: "wrap", alignContent: "space-around", justifyContent: "space-around" }}>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{ transform: "rotate(-28deg)", color: "rgba(11,42,74,0.18)", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", margin: "16px 22px" }}>
          {text}
        </span>
      ))}
    </div>
  );
}

function ItemIcon({ value, fallback = "📄", size = 20 }) {
  if (value && /^https?:\/\//.test(value)) {
    return <img src={value} alt="" style={{ width: size, height: size, borderRadius: 6, objectFit: "cover", display: "inline-block", verticalAlign: "middle" }} />;
  }
  return <span style={{ fontSize: size }}>{value || fallback}</span>;
}

const PKEY = "neurix_progress_v1";
function loadProgress() { try { const r = localStorage.getItem(PKEY); return r ? JSON.parse(r) : { topics: {}, wrong: {} }; } catch { return { topics: {}, wrong: {} }; } }
function saveProgress(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch {} }
function recordQuiz(quizId, score, total, wrongList) {
  const p = loadProgress();
  const pct = Math.round((score / total) * 100);
  const prev = p.topics[quizId];
  p.topics[quizId] = { best: Math.max(pct, prev?.best || 0), last: pct, attempts: (prev?.attempts || 0) + 1, mastered: (prev?.mastered || false) || pct >= 70 };
  p.wrong[quizId] = (wrongList || []).slice(0, 50);
  saveProgress(p); return p;
}

export default function DashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [name, setName] = useState("Student");
  const [tier, setTier] = useState("Gold Member");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState({ name: "home" });
  const [progress, setProgress] = useState({ topics: {}, wrong: {} });
  const [data, setData] = useState({ categories: [], classes: [], materials: [], videos: [], quizzes: [], announcements: [], assignments: [] })

  useEffect(() => {
    const v = localStorage.getItem("neurix_voucher");
    if (!v) { router.replace("/login"); return; }
    setName(localStorage.getItem("neurix_name") || "Student");
    setTier(localStorage.getItem("neurix_tier") || "Gold Member");
    setProgress(loadProgress());
    setAuthed(true);
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const [catsS, classS, matS, vidS, quizS, annS, asgS] = await Promise.all([
          getDocs(collection(db, "categories")), getDocs(collection(db, "classes")),
          getDocs(collection(db, "materials")), getDocs(collection(db, "videos")),
          getDocs(collection(db, "quizzes")), getDocs(collection(db, "announcements")),
          getDocs(collection(db, "assignments")),
        ]);
        setData({
          categories: catsS.docs.map((d) => ({ id: d.id, ...d.data() })),
          classes: classS.docs.map((d) => ({ id: d.id, ...d.data() })),
          materials: matS.docs.map((d) => ({ id: d.id, ...d.data() })),
          videos: vidS.docs.map((d) => ({ id: d.id, ...d.data() })),
          quizzes: quizS.docs.map((d) => ({ id: d.id, ...d.data() })),
          announcements: annS.docs.map((d) => ({ id: d.id, ...d.data() })),
          assignments: asgS.docs.map((d) => ({ id: d.id, ...d.data() })),
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [authed]);

  const go = (v) => { setView(v); window.scrollTo(0, 0); };
  const logout = () => { localStorage.removeItem("neurix_voucher"); localStorage.removeItem("neurix_access"); router.replace("/login"); };
  const onQuizDone = (quizId, score, total, wrongList) => setProgress(recordQuiz(quizId, score, total, wrongList));

  if (!authed) return null;

  const masteredCount = Object.values(progress.topics).filter((t) => t.mastered).length;
  const overallPct = data.quizzes.length ? Math.round((masteredCount / data.quizzes.length) * 100) : 0;

  return (
    <div style={{ ...sans, background: C.paper, minHeight: "100vh", display: "flex" }}>
      <Sidebar view={view} go={go} logout={logout} />
      <main style={{ flex: 1, padding: "24px 28px 60px", maxWidth: 1200 }}>
        {loading ? (
          <p style={{ color: C.inkSoft, padding: "60px 0", textAlign: "center" }}>Memuat konten…</p>
        ) : (
          <div className="nx-page" key={view.name + (view.id || "")}>
            {view.name === "home" && <Home C={C} data={data} name={name} tier={tier} overallPct={overallPct} progress={progress} go={go} />}
            {view.name === "classes" && <ClassesView C={C} data={data} go={go} />}
            {view.name === "materials" && <MaterialsView C={C} data={data} />}
            {view.name === "videos" && <VideosView C={C} data={data} />}
            {view.name === "quiz" && <QuizListView C={C} data={data} progress={progress} go={go} />}
            {view.name === "quizPlay" && <QuizPlayView C={C} data={data} quizId={view.id} go={go} onDone={onQuizDone} />}
            {view.name === "report" && <ReportView C={C} data={data} progress={progress} />}
            {view.name === "progress" && <ProgressView C={C} data={data} progress={progress} setProgress={setProgress} go={go} />}
            {view.name === "assignments" && <AssignmentsView C={C} data={data} />}
{view.name === "consultation" && <ConsultationView C={C} data={data} name={name} />}
{view.name === "profile" && <ProfileView C={C} name={name} tier={tier} progress={progress} data={data} />}
{view.name === "settings" && <SettingsView C={C} />}
{["calendar", "messages"].includes(view.name) && <ComingSoon C={C} view={view.name} />}
          </div>
        )}
      </main>
    </div>
  );
}

function Sidebar({ view, go, logout }) {
  return (
    <aside style={{ width: 232, flexShrink: 0, background: C.card, borderRight: `1px solid ${C.line}`, minHeight: "100vh", padding: "20px 14px", position: "sticky", top: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 18px" }}>
        <img 
          src="/logo-neurix.svg" 
          alt="Neurix Medical" 
          width={28} 
          height={28} 
          style={{ objectFit: "contain" }} 
        />

        <div>
          <div style={{ ...serif, color: C.navy, fontWeight: 700, fontSize: 15, lineHeight: 1 }}>NEURIX</div>
          <div style={{ color: C.gold, fontSize: 9, letterSpacing: ".16em", fontWeight: 700 }}>MEDICAL</div>
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const active = view.name === n.key || (n.key === "quiz" && view.name === "quizPlay");
          return (
            <button key={n.key} onClick={() => go({ name: n.key })}
              style={{
                display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: "9px 12px", borderRadius: 10,
                border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 700 : 500,
                background: active ? C.navy : "transparent", color: active ? "#fff" : C.ink,
              }}>
              <span>{n.icon}</span>{n.label}
            </button>
          );
        })}
      </nav>
      <button onClick={logout} style={{ marginTop: 18, width: "100%", background: "none", border: `1px solid ${C.line}`, color: C.inkSoft, borderRadius: 10, padding: "9px 12px", cursor: "pointer", fontSize: 13 }}>
        ⏻ Keluar
      </button>
    </aside>
  );
}

function ComingSoon({ C, view }) {
  const label = NAV.find((n) => n.key === view)?.label || view;
  return (
    <div style={{ borderRadius: 18, border: `1px dashed ${C.line}`, background: "#fff", padding: 48, textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🚧</div>
      <h3 style={{ ...serif, color: C.navy, margin: "0 0 6px" }}>{label}</h3>
      <p style={{ color: C.inkSoft, fontSize: 14 }}>Halaman ini adalah placeholder — kembangkan sesuai kebutuhan (mis. hubungkan ke koleksi Firestore baru).</p>
    </div>
  );
}

/* ---------- Dashboard Home ---------- */
function Home({ C, data, name, tier, overallPct, progress, go }) {
  const upcoming = data.classes.filter((c) => c.status !== "done").slice(0, 3);
  const stats = [
    { icon: "📚", label: "My Classes", value: `${data.classes.length} Active Classes`, action: () => go({ name: "classes" }), cta: "Lihat kelas" },
    { icon: "📝", label: "Quiz & Try Out", value: `${data.quizzes.length} Available`, action: () => go({ name: "quiz" }), cta: "Kerjakan sekarang" },
    { icon: "📁", label: "Materials", value: `${data.materials.length} Materials`, action: () => go({ name: "materials" }), cta: "Akses materi" },
    { icon: "▶️", label: "Video / Recordings", value: `${data.videos.length} Videos`, action: () => go({ name: "videos" }), cta: "Tonton sekarang" },
    { icon: "📊", label: "Raport", value: "Lihat perkembanganmu", action: () => go({ name: "report" }), cta: "Lihat raport" },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <p style={{ color: C.inkSoft, margin: 0, fontSize: 14 }}>Welcome back,</p>
          <h1 style={{ ...serif, color: C.navy, fontSize: 28, fontWeight: 700, margin: "2px 0 4px" }}>{name} 👋</h1>
          <p style={{ color: C.inkSoft, margin: 0, fontSize: 14 }}>Keep learning, keep growing!</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 20px", minWidth: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkSoft, marginBottom: 6 }}>
              <span>Overall Learning Progress</span><b style={{ color: C.navy }}>{overallPct}%</b>
            </div>
            <div style={{ background: C.line, height: 8, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ background: C.navy, width: `${overallPct}%`, height: "100%" }} />
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏅</span>
            <div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>NEURIX MEMBER</div>
              <div style={{ fontWeight: 700, color: C.gold, fontSize: 14 }}>{tier}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="nx-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <button key={s.label} onClick={s.action} className="nx-lift"
            style={{ textAlign: "left", background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, cursor: "pointer" }}>
            <div style={{ fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, margin: "8px 0 2px", color: C.ink }}>{s.label}</div>
            <div style={{ color: C.inkSoft, fontSize: 12.5 }}>{s.value}</div>
            <div style={{ color: C.navy, fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>{s.cta} →</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
          <h3 style={{ ...serif, color: C.navy, fontSize: 17, margin: "0 0 14px" }}>Upcoming Classes</h3>
          {upcoming.length === 0 && <Empty C={C} text="Belum ada kelas terjadwal." />}
          <div className="nx-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {upcoming.map((cl) => <ClassCard key={cl.id} C={C} cl={cl} data={data} />)}
          </div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
          <h3 style={{ ...serif, color: C.navy, fontSize: 17, margin: "0 0 14px" }}>Pengumuman</h3>
          {data.announcements.length === 0 && <Empty C={C} text="Belum ada pengumuman." />}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.announcements.slice(0, 4).map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 10 }}>
                <span>📌</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassCard({ C, cl, data }) {
  const cat = data.categories.find((c) => c.id === cl.categoryId);
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>{cat?.name || "Umum"}</div>
      <div style={{ fontWeight: 700, fontSize: 14.5, margin: "4px 0 8px" }}>{cl.title}</div>
      <div style={{ fontSize: 12.5, color: C.inkSoft }}>📅 {cl.date}</div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 8 }}>🕒 {cl.time}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{cl.confirmed || 0}/{cl.capacity || 10} Students</span>
        <span style={{ fontSize: 11, background: C.good + "22", color: C.good, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>CONFIRMED</span>
      </div>
    </div>
  );
}

/* ---------- My Classes ---------- */
function ClassesView({ C, data }) {
  return (
    <div>
      <h2 style={{ ...serif, color: C.navy, fontSize: 26, margin: "0 0 16px" }}>My Classes</h2>
      {data.classes.length === 0 && <Empty C={C} text="Belum ada kelas." />}
      <div className="nx-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {data.classes.map((cl) => <ClassCard key={cl.id} C={C} cl={cl} data={data} />)}
      </div>
    </div>
  );
}

/* ---------- Materials ---------- */
function MaterialsView({ C, data }) {
  const [catId, setCatId] = useState("all");
  const [openId, setOpenId] = useState(null);
  const filtered = catId === "all" ? data.materials : data.materials.filter((m) => m.categoryId === catId);
  const wmText = `${typeof window !== "undefined" ? localStorage.getItem("neurix_name") : ""} · ${typeof window !== "undefined" ? localStorage.getItem("neurix_voucher") : ""}`;
  const openItem = filtered.find((x) => x.id === openId);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: 0 }}>Materials</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 20 }}>
        <div>
          <button onClick={() => setCatId("all")} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: catId === "all" ? C.navy : "transparent", color: catId === "all" ? "#fff" : C.ink, cursor: "pointer", fontSize: 13.5, marginBottom: 4 }}>Semua</button>
          {data.categories.map((c) => (
            <button key={c.id} onClick={() => setCatId(c.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: catId === c.id ? C.navy : "transparent", color: catId === c.id ? "#fff" : C.ink, cursor: "pointer", fontSize: 13.5, marginBottom: 4 }}>{c.emoji} {c.name}</button>
          ))}
        </div>
        <div>
          {filtered.length === 0 && <Empty C={C} text="Belum ada materi di kategori ini." />}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ItemIcon value={m.icon} fallback="📄" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: C.inkSoft }}>{m.size || "PDF"}</div>
                  </div>
                </div>
                <button onClick={() => setOpenId(m.id)} style={{ background: C.navy, color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, border: "none", cursor: "pointer" }}>Lihat</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {openItem && (
        <div onClick={() => setOpenId(null)} style={{ position: "fixed", inset: 0, background: "rgba(8,30,56,.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(900px,95vw)", height: "85vh", background: "#fff", borderRadius: 16, overflow: "hidden" }}>
            <iframe src={openItem.fileUrl} title={openItem.title} style={{ width: "100%", height: "100%", border: "none" }} />
            <Watermark text={wmText} />
            <button onClick={() => setOpenId(null)} style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", zIndex: 10, fontSize: 14 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Videos ---------- */
function VideosView({ C, data }) {
  const [openId, setOpenId] = useState(null);
  const wmText = `${typeof window !== "undefined" ? localStorage.getItem("neurix_name") : ""} · ${typeof window !== "undefined" ? localStorage.getItem("neurix_voucher") : ""}`;
  const openItem = data.videos.find((x) => x.id === openId);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
      <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: "0 0 16px" }}>Video / Recordings</h2>
      {data.videos.length === 0 && <Empty C={C} text="Belum ada video." />}
      <div className="nx-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.videos.map((v) => {
          const cat = data.categories.find((c) => c.id === v.categoryId);
          return (
            <div key={v.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 60, height: 44, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", overflow: "hidden" }}>
                  {v.thumbUrl ? <img src={v.thumbUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "▶"}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>{cat?.name || "Umum"}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>{v.instructor} · {v.duration}</div>
                </div>
              </div>
              <button onClick={() => setOpenId(v.id)} style={{ background: C.goldSoft, color: "#1C2430", borderRadius: 8, padding: "7px 16px", fontSize: 12.5, fontWeight: 700, border: "none", cursor: "pointer" }}>Play</button>
            </div>
          );
        })}
      </div>

      {openItem && (
        <div onClick={() => setOpenId(null)} style={{ position: "fixed", inset: 0, background: "rgba(8,30,56,.9)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(920px,95vw)", aspectRatio: "16/9", background: "#000", borderRadius: 16, overflow: "hidden" }}>
            <iframe src={openItem.url} title={openItem.title} allow="autoplay" style={{ width: "100%", height: "100%", border: "none" }} />
            <Watermark text={wmText} />
            <button onClick={() => setOpenId(null)} style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: "none", borderRadius: 999, width: 32, height: 32, cursor: "pointer", zIndex: 10, fontSize: 14 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Quiz & Try Out ---------- */
function QuizListView({ C, data, progress, go }) {
  const [catId, setCatId] = useState("all");
  const filtered = catId === "all" ? data.quizzes : data.quizzes.filter((q) => q.categoryId === catId);
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
      <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: "0 0 16px" }}>Quiz &amp; Try Out</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setCatId("all")} style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid ${catId === "all" ? C.navy : C.line}`, background: catId === "all" ? C.navy : "transparent", color: catId === "all" ? "#fff" : C.ink, fontSize: 13, cursor: "pointer" }}>Semua</button>
        {data.categories.map((c) => (
          <button key={c.id} onClick={() => setCatId(c.id)} style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid ${catId === c.id ? C.navy : C.line}`, background: catId === c.id ? C.navy : "transparent", color: catId === c.id ? "#fff" : C.ink, fontSize: 13, cursor: "pointer" }}>{c.name}</button>
        ))}
      </div>
      {filtered.length === 0 && <Empty C={C} text="Belum ada kuis di kategori ini." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((q) => {
          const st = progress.topics[q.id];
          return (
            <button key={q.id} onClick={() => go({ name: "quizPlay", id: q.id })}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 16px", background: "#fff", cursor: "pointer", textAlign: "left" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{q.title}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>{(q.items || []).length} Soal</div>
              </div>
              {st ? (
                <span style={{ fontSize: 12.5, fontWeight: 700, color: st.mastered ? C.good : C.gold }}>{st.mastered ? "✓ Dikuasai" : `Terbaik ${st.best}%`}</span>
              ) : <span style={{ fontSize: 12.5, color: C.inkSoft }}>Belum dikerjakan</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizPlayView({ C, data, quizId, go, onDone }) {
  const quiz = data.quizzes.find((q) => q.id === quizId);
  const items = quiz?.items || [];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!quiz || items.length === 0) return <Empty C={C} text="Kuis tidak tersedia." />;
  const q = items[idx];

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
    else setWrong((w) => [...w, { q: q.question, picked: q.options[i], correct: q.options[q.answer] }]);
  };
  const next = () => { setPicked(null); if (idx + 1 < items.length) setIdx(idx + 1); else setDone(true); };

  useEffect(() => { if (done && !saved) { onDone(quizId, score, items.length, wrong); setSaved(true); } }, [done]);

  if (done) {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 32, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>{pct >= 70 ? "🎉" : "📚"}</div>
        <h2 style={{ ...serif, color: C.navy, margin: "0 0 6px" }}>Selesai!</h2>
        <p style={{ color: C.inkSoft, marginBottom: 20 }}>{quiz.title}</p>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.gold }}>{score}/{items.length} <span style={{ fontSize: 16, color: C.inkSoft }}>({pct}%)</span></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
          <button onClick={() => { setIdx(0); setPicked(null); setScore(0); setWrong([]); setDone(false); setSaved(false); }} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 700 }}>Ulangi</button>
          <button onClick={() => go({ name: "quiz" })} style={{ background: "none", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer" }}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28, maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.inkSoft, marginBottom: 14 }}>
        <span>Soal {idx + 1} dari {items.length}</span>
        <button onClick={() => go({ name: "quiz" })} style={{ background: "none", border: "none", color: C.inkSoft, cursor: "pointer" }}>Keluar</button>
      </div>
      <div style={{ background: C.line, height: 6, borderRadius: 999, marginBottom: 22 }}>
        <div style={{ background: C.gold, width: `${(idx / items.length) * 100}%`, height: "100%", borderRadius: 999 }} />
      </div>
      <h3 style={{ ...serif, fontSize: 20, marginBottom: 20 }}>{q.question}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          let st = { background: "#fff", border: `1px solid ${C.line}` };
          if (picked !== null) {
            if (i === q.answer) st = { background: C.good + "22", border: `1.5px solid ${C.good}` };
            else if (i === picked) st = { background: C.bad + "22", border: `1.5px solid ${C.bad}` };
          }
          return (
            <button key={i} onClick={() => choose(i)} disabled={picked !== null}
              style={{ ...st, textAlign: "left", padding: "13px 16px", borderRadius: 12, cursor: picked === null ? "pointer" : "default", fontSize: 15 }}>
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && q.discussion && (
        <div style={{ marginTop: 16, background: C.paper, borderRadius: 10, padding: 14, fontSize: 14 }}>
          <b style={{ color: C.gold }}>Pembahasan:</b> {q.discussion}
        </div>
      )}
      {picked !== null && (
        <button onClick={next} style={{ marginTop: 20, width: "100%", padding: 14, background: C.navy, color: "#fff", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700 }}>
          {idx + 1 < items.length ? "Soal berikutnya →" : "Lihat hasil"}
        </button>
      )}
    </div>
  );
}

/* ---------- Report ---------- */
function Donut({ C, data }) {
  // data: [{label, value, color}]
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const r = 60, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = `${frac * circ} ${circ}`;
        const offset = circ * 0.25 - acc * circ;
        acc += frac;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={dash} strokeDashoffset={offset} transform={`rotate(0 ${cx} ${cy})`} />;
      })}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="20" fontWeight="700" fill={C.navy}>{Math.round((data[0]?.value / total) * 100) || 0}%</text>
    </svg>
  );
}

function ReportView({ C, data, progress }) {
  const total = data.quizzes.length;
  const mastered = Object.values(progress.topics).filter((t) => t.mastered).length;
  const avg = total ? Math.round(Object.values(progress.topics).reduce((a, t) => a + (t.best || 0), 0) / (Object.keys(progress.topics).length || 1)) : 0;
  const donutData = [
    { label: "Sangat Baik", value: mastered, color: C.good },
    { label: "Baik", value: Math.max(0, Math.round(total * 0.26)), color: C.gold },
    { label: "Cukup", value: Math.max(0, Math.round(total * 0.1)), color: "#C8A24A" },
    { label: "Perlu Ditingkatkan", value: Math.max(0, total - mastered), color: C.bad },
  ];
  return (
    <div>
      <h2 style={{ ...serif, color: C.navy, fontSize: 26, margin: "0 0 16px" }}>Raport</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div style={{ background: C.navy, color: "#fff", borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 13, opacity: .8 }}>Overall Score</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.gold }}>{avg}<span style={{ fontSize: 16 }}> /100</span></div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
          <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8 }}>Komponen Penilaian</div>
          {[["Quiz", avg], ["Try Out", Math.max(0, avg - 4)], ["Assignment", Math.min(100, avg + 4)], ["Attendance", 100]].map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: C.inkSoft }}>{label}</span><b>{val}/100</b>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8 }}>Topik Penguasaan</div>
          <Donut C={C} data={donutData} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8, fontSize: 11, textAlign: "left" }}>
            {donutData.map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: d.color, display: "inline-block" }} />{d.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Progress ---------- */
function ProgressView({ C, data, progress, setProgress, go }) {
  const studied = data.quizzes.filter((q) => progress.topics[q.id]);
  const weak = studied.filter((q) => !progress.topics[q.id].mastered).sort((a, b) => progress.topics[a.id].best - progress.topics[b.id].best);
  const reset = () => { if (!confirm("Hapus semua data progres Anda?")) return; localStorage.removeItem(PKEY); setProgress({ topics: {}, wrong: {} }); };
  return (
    <div>
      <h2 style={{ ...serif, color: C.navy, fontSize: 26, margin: "0 0 16px" }}>Progress Belajar</h2>
      {studied.length === 0 ? <Empty C={C} text="Belum ada data. Kerjakan kuis dulu." /> : (
        <>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ ...serif, color: C.gold, fontSize: 18 }}>Perlu diperkuat</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {weak.map((q) => {
                const st = progress.topics[q.id];
                return (
                  <button key={q.id} onClick={() => go({ name: "quizPlay", id: q.id })} style={{ display: "flex", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 16px", background: C.card, cursor: "pointer" }}>
                    <span>{q.title}</span><span style={{ color: C.gold, fontWeight: 700 }}>{st.best}%</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={reset} style={{ background: "none", border: `1px solid ${C.line}`, color: C.inkSoft, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>Reset data progres</button>
        </>
      )}
    </div>
  );
}
const AKEY = "neurix_assignments_v1";
function loadDone() { try { return JSON.parse(localStorage.getItem(AKEY) || "{}"); } catch { return {}; } }
function AssignmentsView({ C, data }) {
  const [done, setDone] = useState({});
  useEffect(() => { setDone(loadDone()); }, []);
  const toggle = (id) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next); localStorage.setItem(AKEY, JSON.stringify(next));
  };
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
      <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: "0 0 16px" }}>Assignments</h2>
      {data.assignments.length === 0 && <Empty C={C} text="Belum ada tugas." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.assignments.map((a) => {
          const cat = data.categories.find((c) => c.id === a.categoryId);
          return (
            <div key={a.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, textTransform: "uppercase" }}>{cat?.name || "Umum"}</div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{a.title}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>Batas: {a.dueDate}</div>
                {a.instructions && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>{a.instructions}</div>}
              </div>
              <button onClick={() => toggle(a.id)} style={{
                flexShrink: 0, border: `1px solid ${done[a.id] ? C.good : C.line}`, background: done[a.id] ? C.good + "22" : "#fff",
                color: done[a.id] ? C.good : C.ink, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}>{done[a.id] ? "✓ Selesai" : "Tandai Selesai"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsultationView({ C, data, name }) {
  const [categoryId, setCategoryId] = useState("");
  const [topic, setTopic] = useState("");
  const [sent, setSent] = useState(false);
  const send = async () => {
    if (!categoryId || !topic.trim()) return alert("Pilih kategori & isi topik konsultasi.");
    const cat = data.categories.find((c) => c.id === categoryId);
    const msg = encodeURIComponent(`Halo Neurix Medical, saya ${name} ingin konsultasi topik "${topic}" (${cat?.name || ""}).`);
    window.open(`https://wa.me/62812xxxxxxx?text=${msg}`, "_blank");
    setSent(true);
  };
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, maxWidth: 480 }}>
      <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: "0 0 6px" }}>Consultation</h2>
      <p style={{ color: C.inkSoft, fontSize: 13.5, marginBottom: 18 }}>Ajukan pertanyaan akademik ke tutor Neurix Medical.</p>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, marginBottom: 10 }}>
        <option value="">— pilih kategori —</option>
        {data.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
      </select>
      <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tuliskan pertanyaan/topik…" rows={4}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, marginBottom: 12, fontFamily: "inherit" }} />
      <button onClick={send} style={{ width: "100%", padding: 13, background: C.navy, color: "#fff", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer" }}>Kirim ke Tutor via WhatsApp</button>
      {sent && <p style={{ fontSize: 12.5, color: C.good, marginTop: 10 }}>Terkirim! Tutor akan membalas sesegera mungkin.</p>}
      <p style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 14 }}>Ganti nomor WhatsApp di atas dengan nomor admin Anda.</p>
    </div>
  );
}

function ProfileView({ C, name, tier, progress, data }) {
  const voucher = typeof window !== "undefined" ? localStorage.getItem("neurix_voucher") : "";
  const mastered = Object.values(progress.topics).filter((t) => t.mastered).length;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, maxWidth: 480 }}>
      <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: "0 0 16px" }}>Profile</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>{tier}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}><span style={{ color: C.inkSoft }}>Kode Voucher</span><b style={{ fontFamily: "monospace" }}>{voucher}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}><span style={{ color: C.inkSoft }}>Topik Dikuasai</span><b>{mastered}/{data.quizzes.length}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.inkSoft }}>Kelas Aktif</span><b>{data.classes.length}</b></div>
      </div>
    </div>
  );
}

function SettingsView({ C }) {
  const [notif, setNotif] = useState(true);
  useEffect(() => { const v = localStorage.getItem("neurix_notif"); if (v !== null) setNotif(v === "true"); }, []);
  const toggle = () => { const n = !notif; setNotif(n); localStorage.setItem("neurix_notif", String(n)); };
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, maxWidth: 440 }}>
      <h2 style={{ ...serif, color: C.navy, fontSize: 22, margin: "0 0 16px" }}>Settings</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.line}` }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Notifikasi kelas & pengumuman</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft }}>Preferensi tersimpan di perangkat ini.</div>
        </div>
        <button onClick={toggle} style={{ width: 46, height: 26, borderRadius: 999, border: "none", cursor: "pointer", background: notif ? C.navy : C.line, position: "relative" }}>
          <span style={{ position: "absolute", top: 3, left: notif ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
        </button>
      </div>
      <p style={{ fontSize: 12, color: C.inkSoft, marginTop: 14 }}>Catatan: notifikasi email/WA otomatis belum terhubung — toggle ini baru preferensi lokal.</p>
    </div>
  );
}

function Empty({ C, text }) {
  return <div style={{ borderRadius: 14, border: `1px dashed ${C.line}`, color: C.inkSoft, background: C.paper, padding: 24, textAlign: "center", fontSize: 14 }}>{text}</div>;
}
