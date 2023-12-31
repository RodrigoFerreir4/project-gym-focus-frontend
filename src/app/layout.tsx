import NextAuthSessionProvider from "@/providers/sessionProvider";
import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body className={inter.className}>
        <div className={"bg-black-1 flex-col h-screen flex items-center"}>
          <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
        </div>
      </body>
    </html>
  );
}
