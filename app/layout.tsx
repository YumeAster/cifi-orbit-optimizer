import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", base).toString();

  return {
    metadataBase: base,
    title: "CIFI ORBIT — Unified Optimizer",
    description: "CIFI Optimizer와 Mod Tree Cultivator를 하나로 합친 통합 성장 계획 도구",
    openGraph: {
      title: "CIFI ORBIT — Unified Optimizer",
      description: "두 최적화 도구를 하나의 성장 계획으로 연결합니다.",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "CIFI ORBIT Unified Optimizer" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "CIFI ORBIT — Unified Optimizer",
      description: "두 최적화 도구를 하나의 성장 계획으로 연결합니다.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
