import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HisShell from "@/components/his/HisShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  title: "HIS - Bệnh viện Đa khoa Hòa An",
  description: "Demo hệ thống thông tin bệnh viện (HIS) chạy trên localhost",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HisShell>{children}</HisShell>
      </body>
    </html>
  );
}
