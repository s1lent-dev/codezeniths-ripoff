// Add this <script> tag inside your <head> in layout.tsx
// It runs before React hydrates, so the correct class is set instantly with no flash

// In your layout.tsx:
//
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <script dangerouslySetInnerHTML={{ __html: themeScript }} />
//       </head>
//       <body>{children}</body>
//     </html>
//   )
// }

export const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      // Default to dark if no preference stored
      var isDark = stored ? stored === "dark" : true;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  })();
`.trim()