"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import ProductCard from "@/components/ProductCard";
import Tracker from "@/components/Tracker";
import { taka } from "@/lib/products";
import { LOYALTY } from "@/lib/loyalty";
const call = async (url, method, body) => { const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { ok: r.ok, ...(await r.json()) }; };
const MENU = [["overview", "Overview"], ["orders", "My Orders"], ["wishlist", "Wishlist"], ["addresses", "Addresses"], ["profile", "Profile"], ["password", "Change Password"], ["coupons", "Coupons"], ["points", "Loyalty Points"], ["tracking", "Order Tracking"]];
const couponText = c => (c.type === "percent" ? `${c.value}% off` : `${taka(c.value)} off`) + (c.minOrder ? ` on orders over ${taka(c.minOrder)}` : "");

function OrderCard({ o, track }) {
  return <div className="ord"><header><b>{o.id}</b><span>{o.status}</span></header>
    <small>{new Date(o.date).toLocaleDateString()} · {o.pay === "cod" ? "Cash on delivery" : o.pay}</small>
    <p>{o.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</p>
    <div className="row"><b>{taka(o.total)}</b><button className="lnk" onClick={() => track(o.id)}>Track order</button></div></div>;
}

function Addresses({ data, reload }) {
  const [e, setE] = useState(null); const [err, setErr] = useState("");
  const set = k => ev => setE({ ...e, [k]: ev.target.type === "checkbox" ? ev.target.checked : ev.target.value });
  const act = async (body) => { const r = await call("/api/account", "POST", body); if (!r.ok) return setErr(r.error); setErr(""); setE(null); reload(); };
  if (e) return <div className="form"><h2>{e.id ? "Edit address" : "New address"}</h2>
    <label>Label (Home, Office…)<input value={e.label} onChange={set("label")} /></label>
    <label>Receiver's name<input value={e.name} onChange={set("name")} /></label>
    <label>Mobile number<input value={e.phone} onChange={set("phone")} inputMode="numeric" /></label>
    <label>City<input value={e.city} onChange={set("city")} /></label>
    <label>Full address<textarea rows="3" value={e.address} onChange={set("address")} /></label>
    <label className="radio"><input type="checkbox" checked={!!e.isDefault} onChange={set("isDefault")} />Make this my default address</label>
    {err && <p className="err" role="alert">{err}</p>}
    <div className="acts"><button className="btn" onClick={() => act({ action: "saveAddress", ...e })}>Save address</button><button className="btn sm" onClick={() => { setE(null); setErr(""); }}>Cancel</button></div></div>;
  return <>
    <button className="btn" onClick={() => setE({ label: "Home", name: "", phone: "", city: "Dhaka", address: "" })}>Add address</button>
    {data.addresses.length ? data.addresses.map(a => <div className="ord" key={a.id} style={{ marginTop: 14 }}>
      <header><b>{a.label}</b>{a.isDefault && <span className="ok">Default</span>}</header>
      <p>{a.name} · {a.phone}<br />{a.address}, {a.city}</p>
      <button className="lnk" onClick={() => setE(a)}>Edit</button>
      {!a.isDefault && <button className="lnk" onClick={() => act({ action: "defaultAddress", id: a.id })}>Make default</button>}
      <button className="lnk" onClick={() => confirm("Delete this address?") && act({ action: "deleteAddress", id: a.id })}>Delete</button></div>) : <p className="empty">No saved addresses yet. Add one to check out faster.</p>}
  </>;
}

export default function Account() {
  const { user, setUser, ready, logout } = useAuth(); const { products } = useCart(); const router = useRouter();
  const [tab, setTab] = useState("overview"); const [data, setData] = useState(null); const [trackId, setTrackId] = useState("");
  const [f, setF] = useState(null); const [pw, setPw] = useState({ currentPassword: "", newPassword: "" }); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const reload = () => fetch("/api/account", { cache: "no-store" }).then(r => r.json()).then(setData);
  useEffect(() => { const h = location.hash.slice(1); if (MENU.some(m => m[0] === h)) setTab(h); }, []);
  useEffect(() => { if (ready && !user) router.push("/login"); if (user) { reload(); setF(x => x || { name: user.name, phone: user.phone }); } }, [ready, user?.id]);
  if (!user || !data || !f) return <div className="wrap"><p className="empty">Loading…</p></div>;
  const go = t => { setTab(t); setErr(""); history.replaceState(null, "", "#" + t); };
  const track = id => { setTrackId(id); go("tracking"); };
  const flash = t => { setErr(""); setMsg(t); setTimeout(() => setMsg(""), 2500); };
  async function saveProfile() { const r = await call("/api/auth/me", "PATCH", { name: f.name, phone: f.phone, address: user.address, city: user.city }); if (!r.ok) return setErr(r.error); setUser(r.user); flash("Profile saved"); }
  async function savePw() { const r = await call("/api/auth/me", "PATCH", pw); if (!r.ok) return setErr(r.error); setPw({ currentPassword: "", newPassword: "" }); flash("Password changed"); }
  const wished = products.filter(p => data.wishlist.includes(p.id));
  const def = data.addresses.find(a => a.isDefault);
  return (
    <div className="wrap">
      <h1 className="ptitle">My Account</h1>
      <div className="acctgrid">
        <nav className="side" aria-label="Account">
          {MENU.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => go(k)}>{l}</button>)}
          <button onClick={async () => { await logout(); router.push("/"); }}>Log out</button>
        </nav>
        <section className="panelbox">
          {msg && <p className="ok">{msg}</p>}{err && <p className="err" role="alert">{err}</p>}
          {tab === "overview" && <>
            <h2>Hello, {user.name.split(" ")[0]}</h2>
            <div className="stats">{[["Orders", data.orders.length, "orders"], ["Wishlist", data.wishlist.length, "wishlist"], ["Points", data.points, "points"], ["Coupons", data.coupons.filter(c => !c.used).length, "coupons"]].map(([l, v, t]) => <button key={t} className="stat" onClick={() => go(t)}><b>{v}</b><span>{l}</span></button>)}</div>
            <h2>Latest order</h2>{data.orders[0] ? <OrderCard o={data.orders[0]} track={track} /> : <p className="empty">You have not placed any orders yet.</p>}
            <h2>Default address</h2>{def ? <p>{def.name} · {def.phone}<br />{def.address}, {def.city}</p> : <p><button className="lnk" onClick={() => go("addresses")}>Add a delivery address</button></p>}
          </>}
          {tab === "orders" && (data.orders.length ? data.orders.map(o => <OrderCard key={o.id} o={o} track={track} />) : <p className="empty">You have not placed any orders yet.</p>)}
          {tab === "wishlist" && (wished.length ? <div className="grid">{wished.map(p => <ProductCard key={p.id} p={p} />)}</div> : <p className="empty">Your wishlist is empty. Tap the heart on any product to save it here.</p>)}
          {tab === "addresses" && <Addresses data={data} reload={reload} />}
          {tab === "profile" && <div className="form">
            <label>Full name<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
            <label>Email<input value={user.email} disabled /></label>
            <label>Mobile number<input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} inputMode="numeric" /></label>
            <div><button className="btn" onClick={saveProfile}>Save profile</button></div></div>}
          {tab === "password" && <div className="form">
            <label>Current password<input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></label>
            <label>New password (6+ characters)<input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></label>
            <div><button className="btn" onClick={savePw}>Change password</button></div></div>}
          {tab === "coupons" && (data.coupons.length ? data.coupons.map(c => <div className={"ord coupon" + (c.used ? " usedc" : "")} key={c.code}>
            <header><b className="code">{c.code}</b>{c.used && <span>Used</span>}</header><p>{couponText(c)}{c.note && <><br />{c.note}</>}</p>
            <small>{c.expires ? "Valid until " + c.expires : "No expiry date"} · Enter the code at checkout</small></div>) : <p className="empty">No coupons are available right now. Check back soon.</p>)}
          {tab === "points" && <>
            <div className="bigpts"><b>{data.points}</b><span>points = {taka(data.points * LOYALTY.taka)} off</span></div>
            <p>Earn {LOYALTY.perHundred} points for every ৳100 you spend, added when your order is delivered. Use points at checkout, up to {LOYALTY.maxPct}% of an order.</p>
            <h2>History</h2>{data.pointsLog.length ? <table className="plog"><tbody>{data.pointsLog.map((l, i) => <tr key={i}><td>{new Date(l.date).toLocaleDateString()}</td><td>{l.note}</td><td className={l.delta > 0 ? "ok" : "err"}>{l.delta > 0 ? "+" : ""}{l.delta}</td></tr>)}</tbody></table> : <p className="empty">No points yet. Your first delivered order will earn some.</p>}
          </>}
          {tab === "tracking" && <Tracker loggedIn orders={data.orders} initialId={trackId} />}
        </section>
      </div>
    </div>
  );
}
