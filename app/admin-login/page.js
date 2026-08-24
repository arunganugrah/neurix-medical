"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const C = { paper: "#F7F8FA", ink: "#1C2430", inkSoft: "#5B6B7A", navy: "#0B2A4A", gold: "#D9952F", line: "#E4DFD2", card: "#FFFFFF" };
const sans = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !pass) return alert("Isi email & password.");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      router.replace("/admin");
    } catch (e) {
      alert("Login gagal. Cek email/password.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ ...sans, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.paper, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: 32 }}>
        <h1 style={{ ...serif, color: C.navy, fontSize: 22, fontWeight: 700, textAlign: "center", margin: "0 0 20px" }}>Neurix Admin</h1>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.line}`, marginBottom: 10, boxSizing: "border-box", fontSize: 14.5 }} />
        <input placeholder="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.line}`, marginBottom: 16, boxSizing: "border-box", fontSize: 14.5 }} />
        <button onClick={submit} disabled={busy} style={{ width: "100%", padding: 13, background: C.navy, color: "#fff", borderRadius: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
        <p style={{ textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          <a href="/" style={{ color: C.inkSoft, fontSize: 13, textDecoration: "none" }}>← Kembali ke beranda</a>
        </p>
      </div>
    </div>
  );
}
