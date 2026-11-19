"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
export default function Login() {
  const { setUser } = useAuth(); const router = useRouter();
  const [f, setF] = useState({ identifier: "", password: "" }); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true); setErr("");
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }); const d = await r.json(); setBusy(false);
    if (!r.ok) return setErr(d.error); setUser(d.user); router.push("/account");
  }
  return (
    <div className="authbox"><h1>Log in</h1>
      <div className="form" onKeyDown={e => e.key === "Enter" && go()}>
        <label>Email or mobile number<input value={f.identifier} onChange={e => setF({ ...f, identifier: e.target.value })} autoComplete="username" /></label>
        <label>Password<input type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy} onClick={go}>{busy ? "Logging in…" : "Log in"}</button>
      </div>
      <p className="alt">New to Livora? <Link href="/register" className="u">Create an account</Link></p>
    </div>
  );
}
