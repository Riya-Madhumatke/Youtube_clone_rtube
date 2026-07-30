import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import Head from "next/head";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
<div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Head>
  <title>RTube Clone</title>
</Head>
        <Header />
        <Toaster />
        <div className="flex">
          <Sidebar />
          <Component {...pageProps} />
        </div>
      </div>
      <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="afterInteractive"
/>
    </UserProvider>
  );
}