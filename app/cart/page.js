"use client";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { taka } from "@/lib/products";
import { Thumb } from "@/components/ProductCard";

export default function Cart() {
  const { items, setQty, products, settings } = useCart(); const FREE_OVER = settings.freeOver, FEE = settings.deliveryFee;
  const rows = items.map(i => ({ ...i, p: products.find(p => p.id === i.id) })).filter(r => r.p);
  const sub = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
  const ship = sub === 0 || sub >= FREE_OVER ? 0 : FEE;
  if (!rows.length) return <div className="wrap"><h1 className="ptitle">Your cart</h1><p className="empty">Your cart is empty. <Link href="/shop" className="u">Find something you love</Link></p></div>;
  return (
    <div className="wrap">
      <h1 className="ptitle">Your cart</h1>
      <div className="cartgrid">
        <div>{rows.map(({ p, qty }) => (
          <div className="line" key={p.id}>
            <Thumb p={p} />
            <div><Link href={`/product/${p.id}`}><h3>{p.name}</h3></Link><span className="price">{taka(p.price)}</span></div>
            <div className="qty"><button onClick={() => setQty(p.id, qty - 1)} aria-label="Less">−</button><span>{qty}</span><button onClick={() => setQty(p.id, qty + 1)} aria-label="More">+</button></div>
            <b>{taka(p.price * qty)}</b>
          </div>))}</div>
        <aside className="sum">
          <h3>Order summary</h3>
          <p><span>Subtotal</span><span>{taka(sub)}</span></p>
          <p><span>Delivery</span><span>{ship ? taka(ship) : "Free"}</span></p>
          {ship > 0 && <small>Add {taka(FREE_OVER - sub)} more for free delivery.</small>}
          <p className="tot"><span>Total</span><span>{taka(sub + ship)}</span></p>
          <Link href="/checkout" className="btn full">Checkout</Link>
        </aside>
      </div>
    </div>
  );
}
