"use client";
import { createContext, useContext, useEffect, useState } from "react";
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [store, setStore] = useState({ products: [], settings: { deliveryFee: 80, freeOver: 5000, codEnabled: true }, loaded: false });
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("livora-cart") || "[]")); } catch {} setReady(true);
    fetch("/api/store", { cache: "no-store" }).then(r => r.json()).then(d => setStore({ ...d, loaded: true })); }, []);
  useEffect(() => { if (ready) localStorage.setItem("livora-cart", JSON.stringify(items)); }, [items, ready]);
  const add = (id, qty = 1) => setItems(p => p.some(i => i.id === id) ? p.map(i => i.id === id ? { ...i, qty: i.qty + qty } : i) : [...p, { id, qty }]);
  const setQty = (id, qty) => setItems(p => qty < 1 ? p.filter(i => i.id !== id) : p.map(i => i.id === id ? { ...i, qty } : i));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return <Ctx.Provider value={{ items, add, setQty, clear, count, ...store }}>{children}</Ctx.Provider>;
}
