"use client";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import ProductCard from "@/components/ProductCard";
export default function Shop() {
  const { products } = useCart(); const categories = [...new Set(products.map(p => p.category))];
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [max, setMax] = useState(30000);
  useEffect(() => { const c = new URLSearchParams(location.search).get("c"); if (c) setCat(c); }, []);
  const list = useMemo(() => {
    let l = products.filter(p => (cat === "All" || p.category === cat) && p.price <= max && p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [products, cat, q, sort, max]);
  return (
    <div className="wrap">
      <h1 className="ptitle">Shop</h1>
      <div className="filters">
        <div className="chips">{["All", ...categories].map(c => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>)}</div>
        <div className="controls">
          <input placeholder="Search products" value={q} onChange={e => setQ(e.target.value)} aria-label="Search products" />
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
          <label>Up to ৳{max.toLocaleString("en-IN")}<input type="range" min="1000" max="30000" step="500" value={max} onChange={e => setMax(+e.target.value)} /></label>
        </div>
      </div>
      {list.length ? <div className="grid">{list.map(p => <ProductCard key={p.id} p={p} />)}</div> : <p className="empty">Nothing matches. Try another category or raise the price limit.</p>}
    </div>
  );
}
