"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const C = { paper: "#F6F1E7", ink: "#1C2430", inkSoft: "#5B6B7A", navy: "#0B2A4A", gold: "#D9952F", line: "#E7E2D6", card: "#FFFFFF", good: "#2C7A55", bad: "#B23A2E" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const sans = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Box({ title, children }) {
  return <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, marginBottom: 20 }}>
    <h3 style={{ color: C.navy, fontWeight: 700, margin: "0 0 14px" }}>{title}</h3>{children}</div>;
}
function Inp(props) { return <input {...props} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14.5, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />; }
function Area(props) { return <textarea {...props} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14.5, outline: "none", marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit" }} />; }
function Sel(props) { return <select {...props} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 14.5, marginBottom: 10, boxSizing: "border-box", background: "#fff" }} />; }
function Btn({ children, onClick, disabled, kind }) {
  const bg = kind === "ghost" ? C.card : kind === "gold" ? C.gold : C.navy;
  const col = kind === "ghost" ? C.ink : kind === "gold" ? "#1C2430" : "#fff";
  return <button onClick={onClick} disabled={disabled} style={{ background: bg, color: col, border: kind === "ghost" ? `1px solid ${C.line}` : "none", borderRadius: 10, padding: "9px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13.5, opacity: disabled ? .6 : 1 }}>{children}</button>;
}
function Row({ children }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", marginBottom: 8 }}>{children}</div>; }

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [tab, setTab] = useState("kategori");
  const [data, setData] = useState({ categories: [], classes: [], materials: [], videos: [], quizzes: [], announcements: [], vouchers: [] });

  useEffect(() => {
    document.body.style.background = C.paper;
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u || null); if (!u) router.replace("/admin-login"); });
    return () => unsub();
  }, [router]);

  const reload = async () => {
    const cols = ["categories", "classes", "materials", "videos", "quizzes", "assignments", "announcements", "vouchers"];
    const snaps = await Promise.all(cols.map((c) => getDocs(collection(db, c))));
    const next = {};
    cols.forEach((c, i) => { next[c] = snaps[i].docs.map((d) => ({ id: d.id, ...d.data() })); });
    setData(next);
  };
  useEffect(() => { if (user) reload(); }, [user]);

  if (user === undefined) return <div style={{ ...sans, padding: 60, textAlign: "center", color: C.inkSoft }}>Memeriksa akses…</div>;
  if (!user) return null;

  const TABS = [["kategori", "Kategori"], ["kelas", "Kelas"], ["materi", "Materi"], ["video", "Video"], ["kuis", "Kuis"],["tugas", "Tugas"], ["pengumuman", "Pengumuman"], ["voucher", "Voucher"]];

  return (
    <div style={{ ...sans, background: C.paper, color: C.ink, minHeight: "100vh" }}>
      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.card }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...serif, color: C.navy, fontSize: 19, fontWeight: 700 }}>🧭 Neurix Medical · Admin</span>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/" style={{ fontSize: 13.5, color: C.navy, textDecoration: "none", padding: "6px 10px" }}>Lihat situs</a>
            <button onClick={() => signOut(auth)} style={{ fontSize: 13.5, background: "none", border: `1px solid ${C.line}`, color: C.inkSoft, borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}>Keluar</button>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 80px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              style={tab === k ? { background: C.navy, color: "#fff", border: `1px solid ${C.navy}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 }
                                : { background: C.card, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 }}>
              {label}
            </button>
          ))}
        </div>
        {tab === "kategori" && <Kategori data={data} reload={reload} />}
        {tab === "kelas" && <Kelas data={data} reload={reload} />}
        {tab === "materi" && <Materi data={data} reload={reload} />}
        {tab === "video" && <Video data={data} reload={reload} />}
        {tab === "kuis" && <Kuis data={data} reload={reload} />}
        {tab === "tugas" && <Tugas data={data} reload={reload} />}
        {tab === "pengumuman" && <Pengumuman data={data} reload={reload} />}
        {tab === "voucher" && <Voucher data={data} reload={reload} />}
      </main>
    </div>
  );
}

function Kategori({ data, reload }) {
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("");
  const save = async () => { if (!name.trim()) return alert("Isi nama kategori."); await setDoc(doc(db, "categories", slug(name)), { name: name.trim(), emoji: emoji.trim() }); setName(""); setEmoji(""); reload(); };
  const del = async (id) => { if (!confirm("Hapus kategori ini?")) return; await deleteDoc(doc(db, "categories", id)); reload(); };
  return (
    <Box title="Kategori (mis. Kardiovaskular, Respirasi, Neurologi)">
      <Inp placeholder="Nama kategori" value={name} onChange={(e) => setName(e.target.value)} />
      <Inp placeholder="Emoji (mis. ❤️)" value={emoji} onChange={(e) => setEmoji(e.target.value)} />
      <Btn onClick={save}>+ Tambah Kategori</Btn>
      <div style={{ marginTop: 14 }}>
        {data.categories.map((c) => (
          <Row key={c.id}><span>{c.emoji} <b>{c.name}</b></span><button onClick={() => del(c.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </div>
    </Box>
  );
}

function Kelas({ data, reload }) {
  const [title, setTitle] = useState(""); const [categoryId, setCategoryId] = useState("");
  const [dateV, setDateV] = useState(""); const [timeV, setTimeV] = useState(""); const [capacity, setCapacity] = useState(10); const [confirmed, setConfirmed] = useState(0);
  const save = async () => {
    if (!title.trim() || !categoryId) return alert("Lengkapi judul & kategori.");
    const id = slug(title) + "-" + Date.now();
    await setDoc(doc(db, "classes", id), { title: title.trim(), categoryId, date: dateV, time: timeV, capacity: Number(capacity), confirmed: Number(confirmed), status: "upcoming" });
    setTitle(""); setDateV(""); setTimeV(""); reload();
  };
  const del = async (id) => { if (!confirm("Hapus kelas ini?")) return; await deleteDoc(doc(db, "classes", id)); reload(); };
  return (
    <Box title="Jadwal Kelas">
      <Sel value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">— pilih kategori —</option>
        {data.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
      </Sel>
      <Inp placeholder="Judul kelas (mis. Clinical Reasoning)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Inp placeholder="Tanggal (mis. Sabtu, 25 Mei 2026)" value={dateV} onChange={(e) => setDateV(e.target.value)} />
      <Inp placeholder="Waktu (mis. 19.00 - 21.00 WIB)" value={timeV} onChange={(e) => setTimeV(e.target.value)} />
      <div style={{ display: "flex", gap: 10 }}>
        <Inp placeholder="Kapasitas" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <Inp placeholder="Terkonfirmasi" type="number" value={confirmed} onChange={(e) => setConfirmed(e.target.value)} />
      </div>
      <Btn onClick={save}>+ Tambah Kelas</Btn>
      <div style={{ marginTop: 14 }}>
        {data.classes.map((c) => (
          <Row key={c.id}><span><b>{c.title}</b> <span style={{ color: C.inkSoft }}>· {c.date} · {c.time}</span></span><button onClick={() => del(c.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </div>
    </Box>
  );
}

function Materi({ data, reload }) {
  const [title, setTitle] = useState(""); const [categoryId, setCategoryId] = useState(""); const [fileUrl, setFileUrl] = useState(""); const [size, setSize] = useState("");
  const save = async () => {
    if (!title.trim() || !categoryId) return alert("Lengkapi judul & kategori.");
    const id = slug(title) + "-" + Date.now();
    await setDoc(doc(db, "materials", id), { title: title.trim(), categoryId, fileUrl: fileUrl.trim(), size: size.trim() });
    setTitle(""); setFileUrl(""); setSize(""); reload();
  };
  const del = async (id) => { if (!confirm("Hapus materi ini?")) return; await deleteDoc(doc(db, "materials", id)); reload(); };
  return (
    <Box title="Materi">
      <Sel value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">— pilih kategori —</option>
        {data.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
      </Sel>
      <Inp placeholder="Judul materi" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Inp placeholder="Link PREVIEW Google Drive: https://drive.google.com/file/d/FILE_ID/preview" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
      <Inp placeholder="Ukuran (mis. PDF · 25 MB)" value={size} onChange={(e) => setSize(e.target.value)} />
      <Btn onClick={save}>+ Tambah Materi</Btn>
      <p style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>Catatan: proyek ini tidak memakai Firebase Storage. Simpan file di Google Drive/host lain lalu tempel link-nya di sini.</p>
      <div style={{ marginTop: 14 }}>
        {data.materials.map((m) => (
          <Row key={m.id}><span><b>{m.title}</b> <span style={{ color: C.inkSoft }}>· {m.size}</span></span><button onClick={() => del(m.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </div>
    </Box>
  );
}

function Video({ data, reload }) {
  const [title, setTitle] = useState(""); const [categoryId, setCategoryId] = useState(""); const [url, setUrl] = useState(""); const [duration, setDuration] = useState(""); const [instructor, setInstructor] = useState(""); const [thumbUrl, setThumbUrl] = useState("");
  const save = async () => {
    if (!title.trim() || !categoryId) return alert("Lengkapi judul & kategori.");
    const id = slug(title) + "-" + Date.now();
    await setDoc(doc(db, "videos", id), { title: title.trim(), categoryId, url: url.trim(), duration: duration.trim(), instructor: instructor.trim(), thumbUrl: thumbUrl.trim() });
setTitle(""); setUrl(""); setDuration(""); setInstructor(""); setThumbUrl(""); reload();
  };
  const del = async (id) => { if (!confirm("Hapus video ini?")) return; await deleteDoc(doc(db, "videos", id)); reload(); };
  return (
    <Box title="Video / Recordings">
      <Sel value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">— pilih kategori —</option>
        {data.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
      </Sel>
      <Inp placeholder="Judul video" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Inp placeholder="Link EMBED YouTube: https://www.youtube.com/embed/VIDEO_ID" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Inp placeholder="URL thumbnail (opsional)" value={thumbUrl} onChange={(e) => setThumbUrl(e.target.value)} />
      <div style={{ display: "flex", gap: 10 }}>
        <Inp placeholder="Durasi (mis. 90 menit)" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <Inp placeholder="Pengajar" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
      </div>
      <Btn onClick={save}>+ Tambah Video</Btn>
      <div style={{ marginTop: 14 }}>
        {data.videos.map((v) => (
          <Row key={v.id}><span><b>{v.title}</b> <span style={{ color: C.inkSoft }}>· {v.instructor}</span></span><button onClick={() => del(v.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </div>
    </Box>
  );
}

function Kuis({ data, reload }) {
  const [title, setTitle] = useState(""); const [categoryId, setCategoryId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [bulk, setBulk] = useState("");

  const createQuiz = async () => {
    if (!title.trim() || !categoryId) return alert("Lengkapi judul & kategori.");
    const id = slug(title) + "-" + Date.now();
    await setDoc(doc(db, "quizzes", id), { title: title.trim(), categoryId, items: [] });
    setTitle(""); reload();
  };
  const parseBulk = (text) => {
    const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const items = [];
    blocks.forEach((b) => {
      const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) return;
      const question = lines[0];
      let discussion = ""; const optLines = [];
      lines.slice(1).forEach((l) => { if (l.startsWith("#")) discussion = l.replace(/^#\s?/, ""); else optLines.push(l); });
      let answer = optLines.findIndex((o) => o.startsWith("*")); if (answer === -1) answer = 0;
      const options = optLines.map((o) => o.replace(/^\*\s?/, "").trim()).filter(Boolean);
      if (options.length >= 2) items.push({ question, options, answer, discussion });
    });
    return items;
  };
  const importBulk = async () => {
    if (!quizId) return alert("Pilih kuis dulu.");
    const items = parseBulk(bulk);
    if (items.length === 0) return alert("Tidak ada soal valid.");
    const existing = data.quizzes.find((q) => q.id === quizId)?.items || [];
    await setDoc(doc(db, "quizzes", quizId), { ...data.quizzes.find((q) => q.id === quizId), items: [...existing, ...items] });
    setBulk(""); reload();
  };
  const del = async (id) => { if (!confirm("Hapus kuis ini?")) return; await deleteDoc(doc(db, "quizzes", id)); reload(); };

  return (
    <>
      <Box title="Buat Kuis Baru">
        <Sel value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">— pilih kategori —</option>
          {data.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </Sel>
        <Inp placeholder="Judul kuis (mis. Quiz Kardiovaskular #1)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Btn onClick={createQuiz}>+ Buat Kuis</Btn>
      </Box>
      <Box title="Isi Soal (Input Massal)">
        <Sel value={quizId} onChange={(e) => setQuizId(e.target.value)}>
          <option value="">— pilih kuis —</option>
          {data.quizzes.map((q) => <option key={q.id} value={q.id}>{q.title} ({(q.items || []).length} soal)</option>)}
        </Sel>
        <div style={{ background: "#FCFAF5", border: `1px dashed ${C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12, fontSize: 12.5, color: C.inkSoft, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
{`Pada miopia, bayangan jatuh di mana?
*Depan retina
Tepat di retina
Belakang retina
# Bola mata terlalu panjang, fokus di depan retina.

(pisahkan tiap soal dengan baris kosong, tandai jawaban benar dengan *)`}
        </div>
        <Area placeholder="Tempel soal di sini…" value={bulk} onChange={(e) => setBulk(e.target.value)} rows={8} style={{ fontFamily: "monospace" }} />
        <Btn kind="gold" onClick={importBulk}>⚡ Proses &amp; Tambahkan</Btn>
      </Box>
      <Box title={`Daftar Kuis (${data.quizzes.length})`}>
        {data.quizzes.map((q) => (
          <Row key={q.id}><span><b>{q.title}</b> <span style={{ color: C.inkSoft }}>· {(q.items || []).length} soal</span></span><button onClick={() => del(q.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </Box>
    </>
  );
}

function Tugas({ data, reload }) {
  const [title, setTitle] = useState(""); const [categoryId, setCategoryId] = useState(""); const [dueDate, setDueDate] = useState(""); const [instructions, setInstructions] = useState("");
  const save = async () => {
    if (!title.trim() || !categoryId) return alert("Lengkapi judul & kategori.");
    const id = "ass-" + Date.now();
    await setDoc(doc(db, "assignments", id), { title: title.trim(), categoryId, dueDate: dueDate.trim(), instructions: instructions.trim() });
    setTitle(""); setDueDate(""); setInstructions(""); reload();
  };
  const del = async (id) => { if (!confirm("Hapus tugas ini?")) return; await deleteDoc(doc(db, "assignments", id)); reload(); };
  return (
    <Box title="Assignment / Tugas">
      <Sel value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">— pilih kategori —</option>
        {data.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
      </Sel>
      <Inp placeholder="Judul tugas" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Inp placeholder="Batas waktu (mis. 28 Mei 2026)" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <Area placeholder="Instruksi tugas" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} />
      <Btn onClick={save}>+ Tambah Tugas</Btn>
      <div style={{ marginTop: 14 }}>
        {data.assignments.map((a) => (
          <Row key={a.id}><span><b>{a.title}</b> <span style={{ color: C.inkSoft }}>· {a.dueDate}</span></span><button onClick={() => del(a.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </div>
    </Box>
  );
}

function Pengumuman({ data, reload }) {
  const [title, setTitle] = useState(""); const [dateV, setDateV] = useState("");
  const save = async () => {
    if (!title.trim()) return alert("Isi judul pengumuman.");
    const id = "ann-" + Date.now();
    await setDoc(doc(db, "announcements", id), { title: title.trim(), date: dateV.trim() });
    setTitle(""); setDateV(""); reload();
  };
  const del = async (id) => { if (!confirm("Hapus pengumuman ini?")) return; await deleteDoc(doc(db, "announcements", id)); reload(); };
  return (
    <Box title="Pengumuman">
      <Inp placeholder="Judul pengumuman" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Inp placeholder="Tanggal (mis. 25 Mei 2026)" value={dateV} onChange={(e) => setDateV(e.target.value)} />
      <Btn onClick={save}>+ Tambah Pengumuman</Btn>
      <div style={{ marginTop: 14 }}>
        {data.announcements.map((a) => (
          <Row key={a.id}><span><b>{a.title}</b> <span style={{ color: C.inkSoft }}>· {a.date}</span></span><button onClick={() => del(a.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button></Row>
        ))}
      </div>
    </Box>
  );
}

function Voucher({ data, reload }) {
  const [code, setCode] = useState(""); const [studentName, setStudentName] = useState(""); const [tier, setTier] = useState("Gold Member");
  const add = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return alert("Isi kode voucher.");
    await setDoc(doc(db, "vouchers", c), { active: true, categories: "all", studentName: studentName.trim(), tier });
    setCode(""); setStudentName(""); reload();
  };
  const toggleActive = async (v) => { await setDoc(doc(db, "vouchers", v.id), { ...v, active: !v.active }); reload(); };
  const del = async (id) => { if (!confirm("Hapus voucher?")) return; await deleteDoc(doc(db, "vouchers", id)); reload(); };
  return (
    <Box title="Voucher / Kode Member">
      <Inp placeholder="NRX-2026-001" value={code} onChange={(e) => setCode(e.target.value)} />
      <Inp placeholder="Nama murid (tampil di 'Welcome back, ...')" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
      <Sel value={tier} onChange={(e) => setTier(e.target.value)}>
        <option>Gold Member</option><option>Silver Member</option><option>Platinum Member</option>
      </Sel>
      <Btn onClick={add}>+ Tambah Voucher</Btn>
      <div style={{ marginTop: 14 }}>
        {data.vouchers.map((v) => (
          <Row key={v.id}>
            <span style={{ fontFamily: "monospace" }}><b>{v.id}</b> <span style={{ color: v.active ? C.good : C.bad, fontWeight: 700, marginLeft: 8, fontFamily: sans.fontFamily }}>{v.active ? "AKTIF" : "NONAKTIF"}</span></span>
            <span style={{ display: "flex", gap: 10 }}>
              <button onClick={() => toggleActive(v)} style={{ background: "none", border: "none", color: C.navy, cursor: "pointer" }}>{v.active ? "Nonaktifkan" : "Aktifkan"}</button>
              <button onClick={() => del(v.id)} style={{ background: "none", border: "none", color: C.bad, cursor: "pointer" }}>Hapus</button>
            </span>
          </Row>
        ))}
      </div>
    </Box>
  );
}
