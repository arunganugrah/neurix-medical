"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const C = { paper: "#F7F8FA", ink: "#1C2430", inkSoft: "#5B6B7A", navy: "#0B2A4A", gold: "#D9952F", line: "#E4DFD2", card: "#FFFFFF" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const sans = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.body.style.background = C.paper; }, []);

  const submit = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return alert("Masukkan kode voucher/member.");
    setBusy(true);
    try {
      const snap = await getDoc(doc(db, "vouchers", c));
      if (snap.exists() && snap.data().active === true) {
        const d = snap.data();
        const cats = d.categories === undefined ? "all" : d.categories;
        localStorage.setItem("neurix_voucher", c);
        localStorage.setItem("neurix_access", JSON.stringify(cats));
        localStorage.setItem("neurix_name", d.studentName || "Neurix Student");
        localStorage.setItem("neurix_tier", d.tier || "Gold Member");
        router.replace("/dashboard");
      } else alert("Kode voucher tidak valid atau sudah nonaktif.");
    } catch (e) {
      console.error(e); alert("Terjadi kesalahan. Cek koneksi & konfigurasi Firebase.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ ...sans, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      background: `radial-gradient(1200px 600px at 50% -10%, #ECF1F6 0%, ${C.paper} 55%)` }}>
      <div className="nx-pop" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <svg width={56} height={56} viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke={C.navy} strokeWidth="3" fill="none" />
            <circle cx="32" cy="14" r="4" fill={C.gold} /><circle cx="52" cy="32" r="4" fill={C.navy} />
            <circle cx="32" cy="50" r="4" fill={C.gold} /><circle cx="12" cy="32" r="4" fill={C.navy} />
            <path d="M32 18v10M48 32H38M32 46V36M16 32h10" stroke={C.navy} strokeWidth="2" />
            <circle cx="32" cy="32" r="5" fill={C.navy} />
          </svg>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: "36px 32px", boxShadow: "0 24px 60px -28px rgba(11,42,74,.35)" }}>
          <h1 style={{ ...serif, color: C.navy, fontSize: 26, fontWeight: 700, textAlign: "center", margin: "0 0 4px", letterSpacing: "-.02em" }}>Neurix Medical</h1>
          <p style={{ color: C.inkSoft, textAlign: "center", fontSize: 14, margin: "0 0 26px" }}>Masukkan kode voucher/member untuk mulai belajar.</p>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, letterSpacing: ".08em", textTransform: "uppercase" }}>Kode Voucher</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="NRX-2026-001"
            style={{ width: "100%", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${C.line}`, fontSize: 16, outline: "none",
              margin: "8px 0 18px", textTransform: "uppercase", letterSpacing: ".04em", boxSizing: "border-box", background: "#FCFAF5" }} />
          <button onClick={submit} disabled={busy}
            style={{ width: "100%", padding: 15, background: C.navy, color: "#fff", borderRadius: 14, fontWeight: 700, border: "none", cursor: "pointer", fontSize: 16, opacity: busy ? .7 : 1 }}>
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
          <p style={{ color: C.inkSoft, textAlign: "center", fontSize: 13, marginTop: 20, marginBottom: 0 }}>
            <a href="/" style={{ color: C.navy, textDecoration: "none" }}>← Kembali ke beranda</a>
            <span style={{ opacity: .4, margin: "0 8px" }}>·</span>
            <a href="/admin-login" style={{ color: C.gold, textDecoration: "none" }}>Masuk Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}
