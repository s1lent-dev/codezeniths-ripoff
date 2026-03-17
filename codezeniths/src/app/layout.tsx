import { Providers } from "@/api/provider";
import { themeScript } from "@/lib/theme";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
