import { Providers } from "@/api/provider";
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "CodeZeniths",
  description: "DSA sheet with 600+ problems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className='antialiased'
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
