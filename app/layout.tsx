import "./globals.css";
import { DM_Sans, Playfair_Display } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata = {
  title: "Wall Calendar",
  description: "Interactive wall calendar with day-range selection and notes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="m-0 p-0 font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
