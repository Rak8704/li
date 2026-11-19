"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
export default function Register() {
  const { setUser } = useAuth(); const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function go() {
    setBusy(true); setErr("");
    const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }); const d = await r.json(); setBusy(false);
    if (!r.ok) return setErr(d.error); setUser(d.user); router.push("/account");
  }
  return (
    <div className="authbox"><h1>Create account</h1>
      <div className="form" onKeyDown={e => e.key === "Enter" && go()}>
        <label>Full name<input value={f.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Email<input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Mobile number<input value={f.phone} onChange={set("phone")} inputMode="numeric" placeholder="01XXXXXXXXX" autoComplete="tel" /></label>
        <label>Password (6+ characters)<input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy} onClick={go}>{busy ? "Creating…" : "Create account"}</button>
      </div>
      <p className="alt">Already have an account? <Link href="/login" className="u">Log in</Link></p>
    </div>
  );
}
