import "./globals.css";
import Navbar from "./components/navbar/page";
import Footer from "./components/footer/page";

export const metadata = {
  title: "ระบบขายสินค้าสหกรณ์",
  description: "ระบบขายสินค้าสหกรณ์โรงเรียนบ้านหนองกึ่ม",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
