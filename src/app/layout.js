import "./globals.css";

export const metadata = {
  title: "Google Sheets Gemini Automation",
  description: "Send one Google Sheets cell input through a saved Gemini prompt.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}