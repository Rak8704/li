"use client";
import { useEffect, useState } from "react";
import { taka } from "@/lib/products";
const STEPS = [["New", "Order placed"], ["Confirmed", "Confirmed"], ["Shipped", "Shipped"], ["Delivered", "Delivered"]];
export default function Tracker({ initialId = "", orders = [], loggedIn = false }) {
  const [id, setId] = useState(initialId); const [phone, setPhone] = useState(""); const [o, setO] = useState(null); const [err, setErr] = useState("");
  async function find(i = id, p = phone) {
    setErr(""); setO(null);
    const r = await fetch(`/api/orders/track?id=${encodeURIComponent(i.trim())}&phone=${encodeURIComponent(p)}`); const d = await r.json();
    r.ok ? setO(d.order) : setErr(d.error);
  }
  useEffect(() => { if (initialId) { setId(initialId); find(initialId, ""); } }, [initialId]);
  const when = Object.fromEntries((o?.history || []).map(h => [h.status, h.date]));
  const reached = o ? STEPS.findIndex(s => s[0] === o.status) : -1;
  return (
    <div className="form" style={{ maxWidth: 560 }}>
      {loggedIn && orders.length > 0 && <label>Pick one of your orders<select value="" onChange={e => { setId(e.target.value); find(e.target.value, ""); }}><option value="">Choose an order…</option>{orders.map(x => <option key={x.id} value={x.id}>{x.id} · {x.status}</option>)}</select></label>}
      <label>Order number<input value={id} onChange={e => setId(e.target.value)} placeholder="LV123456" /></label>
      {!loggedIn && <label>Mobile number used for the order<input value={phone} onChange={e => setPhone(e.target.value)} inputMode="numeric" placeholder="01XXXXXXXXX" /></label>}
      <div><button className="btn" onClick={() => find()}>Track order</button></div>
      {err && <p className="err" role="alert">{err}</p>}
      {o && <div className="ord">
        <header><b>{o.id}</b><span>{taka(o.total)}</span></header>
        <p>{o.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</p>
        {o.status === "Cancelled" ? <p className="err">This order was cancelled{when.Cancelled ? " on " + new Date(when.Cancelled).toLocaleDateString() : ""}.</p> :
          <ol className="tl">{STEPS.map(([k, l], i) => <li key={k} className={i <= reached ? "done" : ""}><b>{l}</b>{when[k] && <small>{new Date(when[k]).toLocaleString()}</small>}</li>)}</ol>}
        {o.courier && <p><b>Courier / tracking:</b> {o.courier}</p>}
      </div>}
    </div>
  );
}
