"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
export default function WishButton({ id, className = "heart" }) {
  const { wishlist, toggleWish } = useAuth(); const router = useRouter(); const on = wishlist.includes(id);
  return <button type="button" className={className + (on ? " on" : "")} aria-pressed={on} aria-label={on ? "Remove from wishlist" : "Add to wishlist"} onClick={async e => { e.preventDefault(); if (!(await toggleWish(id))) router.push("/login"); }}>{on ? "♥" : "♡"}</button>;
}
