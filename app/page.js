import Link from "next/link";
import { load } from "@/lib/db";
export const dynamic = "force-dynamic";
import ProductCard from "@/components/ProductCard";
export default async function Home() {
  const { products } = (await load()); const categories = [...new Set(products.map(p => p.category))];
  const best = products.filter(p => p.tags?.includes("best") || p.tags?.includes("new")).slice(0, 8);
  return (<>
    <section className="hero">
      <div className="room" aria-hidden="true"><div className="win"/><div className="lamp"/><div className="plant">🪴</div><div className="chair">🛋️</div><div className="floor"/></div>
      <div className="herotext">
        <h1>Make your space beautiful.</h1>
        <p>Lamps, mirrors, cushions, plants and furniture chosen to make a home feel finished. Pick what you like and we deliver it to your door.</p>
        <Link href="/shop" className="btn">Shop all decor</Link>
      </div>
    </section>
    <section className="wrap">
      <h2>Shop by category</h2>
      <div className="cats">{categories.map(c => <Link key={c} href={`/shop?c=${encodeURIComponent(c)}`} className="cat">{c}</Link>)}</div>
    </section>
    <section className="wrap">
      <h2>New and loved</h2>
      <div className="grid">{best.map(p => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  </>);
}
