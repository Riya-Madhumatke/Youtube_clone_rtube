import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import Head from "next/head";
import Script from "next/script";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";


export default function App({ Component, pageProps }: AppProps) {
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

useEffect(() => {
  const saved = localStorage.getItem("sidebar");

  if (saved !== null) {
    setIsSidebarOpen(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  localStorage.setItem("sidebar", JSON.stringify(isSidebarOpen));
}, [isSidebarOpen]);

return (
    <UserProvider>
<div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Head>
  <title>RTube Clone</title>
</Head>
        <Header
  isSidebarOpen={isSidebarOpen}
  setIsSidebarOpen={setIsSidebarOpen}
/>
        <Toaster richColors position="top-right" />

      <div className="flex">
  {isSidebarOpen && <Sidebar />}
  <main className="flex-1">
    <Component {...pageProps} />
  </main>
</div>
      </div>
      <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="afterInteractive"
/>

    </UserProvider>
  );
}