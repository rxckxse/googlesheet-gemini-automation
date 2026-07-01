import "./globals.css";

export const metadata = {
  title: "Gemini Excel AI",
  description: "Generate text with Google Gemini AI directly in Excel cells.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
