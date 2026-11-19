"use client";
import Tracker from "@/components/Tracker";
import { useAuth } from "@/components/AuthContext";
export default function Track() {
  const { user } = useAuth();
  return <div className="wrap"><h1 className="ptitle">Track your order</h1><Tracker loggedIn={!!user} /></div>;
}
