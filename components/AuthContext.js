"use client";
import { createContext, useContext, useEffect, useState } from "react";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => { fetch("/api/auth/me", { cache: "no-store" }).then(r => r.json()).then(d => { setUser(d.user); setReady(true); }); }, []);
  useEffect(() => { if (user) fetch("/api/account", { cache: "no-store" }).then(r => r.json()).then(d => setWishlist(d.wishlist || [])); else setWishlist([]); }, [user?.id]);
  const logout = async () => { await fetch("/api/auth/login", { method: "DELETE" }); setUser(null); };
  // returns false when the person is not logged in
  const toggleWish = async id => {
    if (!user) return false;
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
    const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "wishlist", id }) });
    if (r.ok) setWishlist((await r.json()).wishlist); return true;
  };
  return <Ctx.Provider value={{ user, setUser, ready, logout, wishlist, toggleWish }}>{children}</Ctx.Provider>;
}
