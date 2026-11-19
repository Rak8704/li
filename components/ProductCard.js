"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { taka } from "@/lib/products";
import { useCart } from "./CartContext";
import WishButton from "./WishButton";
export function Thumb({ p, big }) {
  return <div className={"thumb" + (big ? " big" : "")} style={{ background: p.tint }}>{p.image ? <img src={p.image} alt={p.name} /> : <span>{p.emoji}</span>}</div>;
}
export default function ProductCard({ p }) {
  const { add } = useCart();
  const router = useRouter();
  const out = p.stock <= 0;
  return (
    <article className="card">
      <WishButton id={p.id} />
      <Link href={`/product/${p.id}`}><Thumb p={p} />{p.tags?.includes("new") && <i className="tag">New</i>}</Link>
      <div className="cbody">
        <small>{p.category}</small>
        <Link href={`/product/${p.id}`}><h3>{p.name}</h3></Link>
        <div className="price">{taka(p.price)}{p.old && <s>{taka(p.old)}</s>}</div>
        <div className="acts">
          <button className="btn sm" disabled={out} onClick={() => add(p.id)}>{out ? "Sold out" : "Add to cart"}</button>
          <button className="btn sm now" disabled={out} onClick={() => { add(p.id); router.push("/checkout"); }}>Buy now</button>
        </div>
      </div>
    </article>
  );
}
