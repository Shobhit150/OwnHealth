import { Sora } from "next/font/google";
import "./globals.css";
 
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
});
 
export const metadata = {
  title: "VitalScan — AI Health Record Analysis",
  description: "Upload any medical PDF and get an instant AI-powered health analysis.",
};
 
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sora.variable}>
      <body className={sora.className}>{children}</body>
    </html>
  );
}