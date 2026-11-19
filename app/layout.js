import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/Header";
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--display" });
const body = Jost({ subsets: ["latin"], variable: "--body" });
export const metadata = { title: "Livora | Make Your Space Beautiful", description: "Home decor for every room. Wall decor, lighting, plants, textiles and furniture delivered across Bangladesh." };
export default function RootLayout({ children }) {
  return (
    <html lang="en"><body className={`${display.variable} ${body.variable}`}>
      <AuthProvider><CartProvider><Header /><main>{children}</main>
        <footer className="ftr"><div className="brand">Livora</div><p>Make Your Space Beautiful.</p><small>Cash on delivery, bKash and Nagad. Delivery across Bangladesh.</small></footer>
      </CartProvider></AuthProvider>
    </body></html>
  );
}
