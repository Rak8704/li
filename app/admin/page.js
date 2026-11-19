"use client";
import { useEffect, useState } from "react";
import { taka } from "@/lib/products";
const blank = { name: "", category: "", price: "", old: "", stock: 10, desc: "", image: "", isNew: false };
const api = async (url, method, body) => { const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { ok: r.ok, ...(await r.json()) }; };
export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]); const [settings, setSettings] = useState(null); const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]); const [sel, setSel] = useState(null); const [uq, setUq] = useState(""); const [uf, setUf] = useState({ name: "", phone: "" }); const [pa, setPa] = useState({ delta: "", note: "" }); const [npw, setNpw] = useState("");
  const [coupons, setCoupons] = useState([]); const [cf, setCf] = useState({ code: "", type: "percent", value: "", minOrder: "", expires: "", maxUses: "", note: "", public: true });
  const [form, setForm] = useState(null); const [msg, setMsg] = useState("");
  const refresh = async () => {
    const s = await (await fetch("/api/store", { cache: "no-store" })).json(); setProducts(s.products); setSettings(s.settings);
    const o = await fetch("/api/orders", { cache: "no-store" }); if (o.ok) setOrders((await o.json()).orders);
    const us = await fetch("/api/admin/users", { cache: "no-store" }); if (us.ok) setUsers((await us.json()).users);
    const c = await fetch("/api/admin/coupons", { cache: "no-store" }); if (c.ok) setCoupons((await c.json()).coupons);
  };
  useEffect(() => { fetch("/api/admin/login").then(r => r.json()).then(d => { setAuthed(d.admin); if (d.admin) refresh(); }); }, []);
  const flash = t => { setMsg(t); setTimeout(() => setMsg(""), 2500); };
  async function login() { const r = await api("/api/admin/login", "POST", { password: pw }); if (r.ok) { setAuthed(true); setErr(""); refresh(); } else setErr(r.error); }
  async function logout() { await api("/api/admin/login", "DELETE"); setAuthed(false); }
  async function saveProduct() {
    const r = await api("/api/admin/products", form.id ? "PUT" : "POST", form);
    if (!r.ok) return setErr(r.error); setErr(""); setForm(null); flash("Product saved"); refresh();
  }
  async function del(p) { if (confirm(`Delete "${p.name}"?`)) { await api("/api/admin/products", "DELETE", { id: p.id }); refresh(); } }
  async function upload(e) {
    const file = e.target.files[0]; if (!file) return;
    try {
      const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(file); });
      const k = Math.min(1, 900 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      const r = await api("/api/admin/upload", "POST", { dataUrl: c.toDataURL("image/jpeg", 0.8) });
      r.ok ? setForm(f => ({ ...f, image: r.url })) : setErr(r.error);
    } catch { setErr("Could not read that image. Try a JPG or PNG."); }
  }
  async function saveSettings() { const r = await api("/api/admin/settings", "PUT", settings); r.ok ? flash("Settings saved") : setErr(r.error); }
  async function setStatus(id, status) { await api("/api/orders", "PATCH", { id, status }); refresh(); }
  const setS = k => e => setSettings({ ...settings, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const userAct = async (body, okMsg) => { const r = await api("/api/admin/users", "PATCH", body); if (!r.ok) return setErr(r.error); setErr(""); flash(okMsg); refresh(); };
  const setW = (k, f) => e => setSettings({ ...settings, wallets: { ...settings.wallets, [k]: { ...settings.wallets[k], [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value } } });
  const setF = k => e => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  if (authed === null) return <div className="adm"><p>Loading…</p></div>;
  if (!authed) return (
    <div className="adm" style={{ maxWidth: 420 }}>
      <h1>Admin sign in</h1>
      <div className="form"><label>Password<input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} /></label>
        {err && <p className="err">{err}</p>}<button className="btn" onClick={login}>Sign in</button></div>
    </div>);

  return (
    <div className="adm">
      <h1>Livora admin</h1>
      <div className="bar">
        {["products", "orders", "users", "coupons", "payments"].map(t => <button key={t} className={"chip" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>{t === "products" ? "Products" : t === "orders" ? `Orders (${orders.length})` : t === "users" ? `Users (${users.length})` : t === "coupons" ? "Coupons" : "Payments & delivery"}</button>)}
        <span style={{ flex: 1 }} /><span className="ok">{msg}</span><button className="lnk" onClick={logout}>Sign out</button>
      </div>

      {tab === "products" && (form ? (
        <div className="panel form">
          <h2>{form.id ? "Edit product" : "Add product"}</h2>
          <div className="two">
            <label>Name<input value={form.name} onChange={setF("name")} /></label>
            <label>Category<input list="cats" value={form.category} onChange={setF("category")} /><datalist id="cats">{[...new Set(products.map(p => p.category))].map(c => <option key={c} value={c} />)}</datalist></label>
            <label>Price (৳)<input type="number" min="0" value={form.price} onChange={setF("price")} /></label>
            <label>Old price (৳, optional)<input type="number" min="0" value={form.old || ""} onChange={setF("old")} /></label>
            <label>Quantity in stock<input type="number" min="0" value={form.stock} onChange={setF("stock")} /></label>
            <label className="chk"><input type="checkbox" checked={!!form.isNew} onChange={setF("isNew")} />Show "New" badge</label>
          </div>
          <label>Details<textarea rows="4" value={form.desc} onChange={setF("desc")} /></label>
          <label>Picture<input type="file" accept="image/*" onChange={upload} /></label>
          {form.image && <img src={form.image} alt="" style={{ width: 140, height: 140, objectFit: "cover" }} />}
          {err && <p className="err">{err}</p>}
          <div className="bar"><button className="btn" onClick={saveProduct}>Save product</button><button className="btn sm" onClick={() => { setForm(null); setErr(""); }}>Cancel</button></div>
        </div>
      ) : (<>
        <div className="bar"><button className="btn" onClick={() => setForm(blank)}>Add product</button></div>
        <table><thead><tr><th>Picture</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>{products.map(p => <tr key={p.id}>
            <td>{p.image ? <img className="mini" src={p.image} alt="" /> : <div className="mini" style={{ background: p.tint }}>{p.emoji}</div>}</td>
            <td>{p.name}</td><td>{p.category}</td><td>{taka(p.price)}</td>
            <td style={{ color: p.stock <= 0 ? "#a3261a" : p.stock <= 5 ? "#b9770e" : "inherit" }}>{p.stock <= 0 ? "Sold out" : p.stock}</td>
            <td><button className="lnk" onClick={() => setForm({ ...p, isNew: p.tags?.includes("new") })}>Edit</button><button className="lnk" onClick={() => del(p)}>Delete</button></td></tr>)}</tbody></table>
      </>))}

      {tab === "orders" && (orders.length ? <table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id}>
          <td><b>{o.id}</b><br /><small>{new Date(o.date).toLocaleString()}</small></td>
          <td>{o.name}<br />{o.phone}<br /><small>{o.address}, {o.city}</small></td>
          <td>{o.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</td><td>{taka(o.total)}</td>
          <td>{o.pay === "cod" ? "Cash on delivery" : o.pay}{o.trxId && <><br /><small>TrxID {o.trxId}</small></>}</td>
          <td><input placeholder="Courier / tracking no." defaultValue={o.courier || ""} onBlur={async e => { await api("/api/orders", "PATCH", { id: o.id, note: e.target.value }); }} style={{ marginBottom: 6 }} />{(o.discount > 0 || o.pointsUsed > 0) && <small>Discount −{taka((o.discount || 0) + (o.pointsUsed || 0))}<br /></small>}<select value={o.status} onChange={e => setStatus(o.id, e.target.value)}>{["New", "Confirmed", "Shipped", "Delivered", "Cancelled"].map(x => <option key={x}>{x}</option>)}</select></td></tr>)}</tbody></table>
        : <p className="empty">No orders yet.</p>)}

      {tab === "users" && (sel ? (() => { const u = users.find(x => x.id === sel); if (!u) return null; const uo = orders.filter(o => o.userId === u.id); return (
        <div>
          <div className="bar"><button className="btn sm" onClick={() => { setSel(null); setErr(""); }}>Back to users</button></div>
          <div className="panel form"><h2>{u.name}{u.blocked && <small className="err"> (blocked)</small>}</h2>
            <p>{u.email} · Joined {u.created ? new Date(u.created).toLocaleDateString() : "earlier"} · {u.orders} orders · {taka(u.spent)} spent · {u.points} points · {u.addresses} saved addresses</p>
            <div className="two"><label>Name<input value={uf.name} onChange={e => setUf({ ...uf, name: e.target.value })} /></label><label>Mobile number<input value={uf.phone} onChange={e => setUf({ ...uf, phone: e.target.value })} inputMode="numeric" /></label></div>
            {err && <p className="err">{err}</p>}
            <div className="bar"><button className="btn" onClick={() => userAct({ action: "edit", id: u.id, ...uf }, "User saved")}>Save details</button>
              <button className="btn sm" onClick={() => userAct({ action: "block", id: u.id, blocked: !u.blocked }, u.blocked ? "User unblocked" : "User blocked")}>{u.blocked ? "Unblock user" : "Block user"}</button>
              <button className="btn sm" onClick={async () => { if (confirm(`Delete ${u.name}? Their past orders stay in the order list.`)) { await api("/api/admin/users", "DELETE", { id: u.id }); setSel(null); flash("User deleted"); refresh(); } }}>Delete user</button></div>
          </div>
          <div className="panel form"><h2>Loyalty points</h2>
            <div className="two"><label>Add or remove points (50 or -20)<input type="number" value={pa.delta} onChange={e => setPa({ ...pa, delta: e.target.value })} /></label><label>Reason<input value={pa.note} onChange={e => setPa({ ...pa, note: e.target.value })} /></label></div>
            <div><button className="btn sm" onClick={() => userAct({ action: "points", id: u.id, ...pa }, "Points updated")}>Update points</button></div></div>
          <div className="panel form"><h2>Reset password</h2>
            <label>New password (6+ characters)<input value={npw} onChange={e => setNpw(e.target.value)} /></label>
            <small>Tell the customer the new password and ask them to change it in My Account.</small>
            <div><button className="btn sm" onClick={() => userAct({ action: "password", id: u.id, password: npw }, "Password changed")}>Set password</button></div></div>
          <h2>Orders</h2>
          {uo.length ? <table><thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>{uo.map(o => <tr key={o.id}><td>{o.id}<br /><small>{new Date(o.date).toLocaleDateString()}</small></td><td>{o.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</td><td>{taka(o.total)}</td><td>{o.status}</td></tr>)}</tbody></table> : <p className="empty">No orders yet.</p>}
        </div>); })() : (<>
        <div className="bar"><input placeholder="Search name, email or mobile" value={uq} onChange={e => setUq(e.target.value)} style={{ maxWidth: 320 }} /><span className="ok">{msg}</span></div>
        {users.length ? <table><thead><tr><th>Customer</th><th>Orders</th><th>Spent</th><th>Points</th><th>Status</th><th></th></tr></thead>
          <tbody>{users.filter(u => (u.name + u.email + u.phone).toLowerCase().includes(uq.toLowerCase())).map(u => <tr key={u.id}>
            <td><b>{u.name}</b><br /><small>{u.email} · {u.phone}</small></td><td>{u.orders}</td><td>{taka(u.spent)}</td><td>{u.points}</td>
            <td className={u.blocked ? "err" : "ok"}>{u.blocked ? "Blocked" : "Active"}</td>
            <td><button className="lnk" onClick={() => { setSel(u.id); setUf({ name: u.name, phone: u.phone }); setPa({ delta: "", note: "" }); setNpw(""); setErr(""); }}>Manage</button></td></tr>)}</tbody></table> : <p className="empty">No customers have registered yet.</p>}
      </>))}

      {tab === "coupons" && <>
        <div className="panel form"><h2>New coupon</h2>
          <div className="two">
            <label>Code<input value={cf.code} onChange={e => setCf({ ...cf, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" /></label>
            <label>Type<select value={cf.type} onChange={e => setCf({ ...cf, type: e.target.value })}><option value="percent">Percent off</option><option value="fixed">Fixed ৳ off</option></select></label>
            <label>Value ({cf.type === "percent" ? "%" : "৳"})<input type="number" min="0" value={cf.value} onChange={e => setCf({ ...cf, value: e.target.value })} /></label>
            <label>Minimum order (৳)<input type="number" min="0" value={cf.minOrder} onChange={e => setCf({ ...cf, minOrder: e.target.value })} /></label>
            <label>Expires on<input type="date" value={cf.expires} onChange={e => setCf({ ...cf, expires: e.target.value })} /></label>
            <label>Max total uses (0 = unlimited)<input type="number" min="0" value={cf.maxUses} onChange={e => setCf({ ...cf, maxUses: e.target.value })} /></label>
          </div>
          <label>Note shown to customers<input value={cf.note} onChange={e => setCf({ ...cf, note: e.target.value })} /></label>
          <label className="chk"><input type="checkbox" checked={cf.public} onChange={e => setCf({ ...cf, public: e.target.checked })} />Show in customers' Coupons page</label>
          {err && <p className="err">{err}</p>}
          <div><button className="btn" onClick={async () => { const r = await api("/api/admin/coupons", "POST", cf); if (!r.ok) return setErr(r.error); setErr(""); setCf({ ...cf, code: "", value: "", note: "" }); flash("Coupon created"); refresh(); }}>Create coupon</button></div>
        </div>
        <table><thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Expires</th><th></th></tr></thead>
          <tbody>{coupons.map(c => <tr key={c.code}><td><b>{c.code}</b>{!c.public && <><br /><small>hidden</small></>}</td><td>{c.type === "percent" ? c.value + "%" : taka(c.value)}{c.minOrder > 0 && <><br /><small>min {taka(c.minOrder)}</small></>}</td><td>{c.used || 0}{c.maxUses ? " / " + c.maxUses : ""}</td><td>{c.expires || "-"}</td>
            <td><button className="lnk" onClick={async () => { await api("/api/admin/coupons", "PUT", { code: c.code, active: !c.active }); refresh(); }}>{c.active ? "Turn off" : "Turn on"}</button><button className="lnk" onClick={async () => { if (confirm("Delete " + c.code + "?")) { await api("/api/admin/coupons", "DELETE", { code: c.code }); refresh(); } }}>Delete</button></td></tr>)}</tbody></table>
        {!coupons.length && <p className="empty">No coupons yet.</p>}
      </>}

      {tab === "payments" && settings && (
        <div className="panel form">
          <h2>Payment methods</h2>
          {["bKash", "Nagad", "Rocket", "Upay"].map(k => settings.wallets[k] && <div className="two" key={k}>
            <label>{k} number<input value={settings.wallets[k].number} onChange={setW(k, "number")} placeholder="01XXXXXXXXX" /></label>
            <label>{k} account type<select value={settings.wallets[k].type} onChange={setW(k, "type")}><option>Personal</option><option>Merchant</option><option>Agent</option></select></label>
            <label className="chk"><input type="checkbox" checked={settings.wallets[k].enabled} onChange={setW(k, "enabled")} />Accept {k} (needs a number)</label>
          </div>)}
          <label className="chk"><input type="checkbox" checked={settings.codEnabled} onChange={setS("codEnabled")} />Accept cash on delivery</label>
          <h2>Delivery</h2>
          <div className="two"><label>Delivery fee (৳)<input type="number" min="0" value={settings.deliveryFee} onChange={setS("deliveryFee")} /></label>
            <label>Free delivery over (৳)<input type="number" min="0" value={settings.freeOver} onChange={setS("freeOver")} /></label></div>
          {err && <p className="err">{err}</p>}
          <div><button className="btn" onClick={saveSettings}>Save settings</button></div>
        </div>)}
    </div>
  );
}
