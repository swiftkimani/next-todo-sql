import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "TaskFlow - Beautiful Todo App",
  description: "A stunning todo application with user authentication and cloud sync",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Script src="//embed.typeform.com/next/embed.js" />
      </body>
    </html>
  );
}
