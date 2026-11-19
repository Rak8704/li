"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import WishButton from "./WishButton";
export default function AddToCart({ id, stock }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQ] = useState(1);
  const [done, setDone] = useState(false);
  if (stock <= 0) return <p className="err">Sold out for now.</p>;
  return (
    <div className="buy">
      <div className="qty"><button onClick={() => setQ(Math.max(1, qty - 1))} aria-label="Less">−</button><span>{qty}</span><button onClick={() => setQ(Math.min(stock, qty + 1))} aria-label="More">+</button></div>
      <button className="btn" onClick={() => { add(id, qty); setDone(true); }}>Add to cart</button>
      <button className="btn now" onClick={() => { add(id, qty); router.push("/checkout"); }}>Buy now</button>
      <WishButton id={id} className="heart inline" />
      {done && <Link href="/cart" className="added">Added. View cart</Link>}
    </div>
  );
}
