"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
export default function Header() {
  const { count } = useCart();
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  return (
    <header className="hdr">
      <Link href="/" className="brand">Livora</Link>
      <nav>
        <Link href="/shop">Shop</Link>
        <Link href="/track">Track order</Link>
        {ready && (user ? <>
          <Link href="/account">{user.name.split(" ")[0]}</Link>
          <button className="navbtn" onClick={async () => { await logout(); router.push("/"); }}>Log out</button>
        </> : <><Link href="/login">Log in</Link><Link href="/register">Register</Link></>)}
        <Link href="/cart" className="cartlink">Cart{count > 0 && <b>{count}</b>}</Link>
      </nav>
    </header>
  );
}
