"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { taka } from "@/lib/products";
import { LOYALTY } from "@/lib/loyalty";
export default function Checkout() {
  const { items, clear, products, settings: s, loaded } = useCart();
  const { user } = useAuth();
  const [f, setF] = useState({ name: "", phone: "", city: "Dhaka", address: "", pay: "cod", trxId: "" });
  const [acct, setAcct] = useState({ addresses: [], points: 0 });
  const [code, setCode] = useState(""); const [applied, setApplied] = useState(null); const [cmsg, setCmsg] = useState("");
  const [usePts, setUsePts] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [order, setOrder] = useState(null);
  const useAddr = a => setF(x => ({ ...x, name: a.name, phone: a.phone, city: a.city, address: a.address }));
  useEffect(() => { if (!user) return; setF(x => ({ ...x, name: x.name || user.name, phone: x.phone || user.phone }));
    fetch("/api/account", { cache: "no-store" }).then(r => r.json()).then(d => { setAcct(d); const a = d.addresses?.find(a => a.isDefault); if (a) useAddr(a); }); }, [user?.id]);
  const rows = items.map(i => ({ ...i, p: products.find(p => p.id === i.id) })).filter(r => r.p);
  const sub = rows.reduce((t, r) => t + r.p.price * r.qty, 0);
  useEffect(() => { setApplied(null); setCmsg(""); }, [sub]);
  const disc = applied?.discount || 0;
  const ship = sub >= s.freeOver ? 0 : s.deliveryFee;
  const ptsMax = user ? Math.min(acct.points || 0, Math.floor((sub - disc) * LOYALTY.maxPct / 100 / LOYALTY.taka)) : 0;
  const pts = usePts ? ptsMax : 0;
  const total = sub - disc - pts * LOYALTY.taka + ship;
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const W = s.wallets || {};
  const methods = [s.codEnabled && ["cod", "Cash on delivery"], ...Object.keys(W).filter(k => W[k].enabled && W[k].number).map(k => [k, k])].filter(Boolean);
  async function apply() {
    const r = await fetch("/api/coupons/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, subtotal: sub }) }); const d = await r.json();
    if (r.ok) { setApplied(d); setCmsg(""); } else { setApplied(null); setCmsg(d.error); }
  }
  async function submit(pay) {
    setErr(""); setBusy(true);
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, pay, items, coupon: applied?.code || "", usePoints: pts }) });
    const d = await r.json(); setBusy(false);
    if (!r.ok) return setErr(d.error); setOrder(d.order); clear();
  }
  if (order) return <div className="wrap done"><h1>Thank you, {order.name.split(" ")[0]}.</h1><p>Your order <b>{order.id}</b> is placed. Total {taka(order.total)}, paid by {order.pay === "cod" ? "cash on delivery" : order.pay}. We will call {order.phone} to confirm delivery.</p><Link href={user ? "/account#tracking" : "/track"} className="btn">Track this order</Link></div>;
  if (!loaded) return <div className="wrap"><p className="empty">Loading…</p></div>;
  if (!rows.length) return <div className="wrap"><p className="empty">Nothing to check out. <Link href="/shop" className="u">Go to the shop</Link></p></div>;
  const pay = methods.some(m => m[0] === f.pay) ? f.pay : methods[0]?.[0];
  const num = W[pay]?.number || "";
  return (
    <div className="wrap">
      <h1 className="ptitle">Checkout</h1>
      <div className="cartgrid">
        <div className="form">
          {!user && <p className="hint"><Link href="/login" className="u">Log in</Link> to use saved addresses, coupons and loyalty points.</p>}
          {acct.addresses.length > 0 && <label>Saved addresses<select value="" onChange={e => { const a = acct.addresses.find(a => a.id === e.target.value); if (a) useAddr(a); }}><option value="">Choose a saved address…</option>{acct.addresses.map(a => <option key={a.id} value={a.id}>{a.label} · {a.address.slice(0, 40)}</option>)}</select></label>}
          <label>Full name<input value={f.name} onChange={set("name")} autoComplete="name" /></label>
          <label>Mobile number<input value={f.phone} onChange={set("phone")} inputMode="numeric" placeholder="01XXXXXXXXX" autoComplete="tel" /></label>
          <label>City<input value={f.city} onChange={set("city")} /></label>
          <label>Full address<textarea rows="3" value={f.address} onChange={set("address")} /></label>
          <fieldset><legend>Payment</legend>
            {methods.map(([v, l]) => <label key={v} className="radio"><input type="radio" name="pay" checked={pay === v} onChange={() => setF({ ...f, pay: v })} />{l}</label>)}
            {num && <div className="paybox"><p>Send <b>{taka(total)}</b> to {pay} {W[pay]?.type} number <b>{num}</b>, then enter the transaction ID.</p><input placeholder="Transaction ID (TrxID)" value={f.trxId} onChange={set("trxId")} /></div>}
          </fieldset>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn" disabled={busy || !methods.length} onClick={() => submit(pay)}>{busy ? "Placing order…" : "Place order"}</button>
        </div>
        <aside className="sum"><h3>Your items</h3>
          {rows.map(r => <p key={r.id}><span>{r.p.name} × {r.qty}</span><span>{taka(r.p.price * r.qty)}</span></p>)}
          <div className="couponrow"><input placeholder="Coupon code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} /><button className="btn sm" onClick={apply} disabled={!code}>Apply</button></div>
          {cmsg && <small className="err">{cmsg}</small>}{applied && <small className="ok">Coupon {applied.code} applied</small>}
          {user && ptsMax > 0 && <label className="radio"><input type="checkbox" checked={usePts} onChange={e => setUsePts(e.target.checked)} />Use {ptsMax} points (−{taka(ptsMax * LOYALTY.taka)})</label>}
          <p><span>Subtotal</span><span>{taka(sub)}</span></p>
          {disc > 0 && <p><span>Coupon</span><span>−{taka(disc)}</span></p>}
          {pts > 0 && <p><span>Points</span><span>−{taka(pts * LOYALTY.taka)}</span></p>}
          <p><span>Delivery</span><span>{ship ? taka(ship) : "Free"}</span></p>
          <p className="tot"><span>Total</span><span>{taka(total)}</span></p></aside>
      </div>
    </div>
  );
}
