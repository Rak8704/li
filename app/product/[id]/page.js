import Link from "next/link";
import { notFound } from "next/navigation";
import { taka } from "@/lib/products";
import { load } from "@/lib/db";
export const dynamic = "force-dynamic";
import ProductCard, { Thumb } from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";

export default async function Product({ params }) {
  const products = (await load()).products;
  const p = products.find(x => x.id === params.id);
  if (!p) notFound();
  const more = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
  return (
    <div className="wrap">
      <p className="crumb"><Link href="/shop">Shop</Link> / {p.category}</p>
      <div className="detail">
        <Thumb p={p} big />
        <div>
          <h1>{p.name}</h1>
          <p className="price lg">{taka(p.price)}{p.old && <s>{taka(p.old)}</s>}</p>
          <p className="desc">{p.desc}</p>
          {p.stock > 0 && p.stock <= 5 && <p className="low">Only {p.stock} left</p>}
          <AddToCart id={p.id} stock={p.stock} />
          <ul className="perks"><li>Delivery in 2 to 4 days in Dhaka</li><li>7-day easy returns</li><li>Pay on delivery, bKash or Nagad</li></ul>
        </div>
      </div>
      {more.length > 0 && <><h2>You may also like</h2><div className="grid">{more.map(m => <ProductCard key={m.id} p={m} />)}</div></>}
    </div>
  );
}
