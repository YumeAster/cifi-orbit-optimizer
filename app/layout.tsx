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
    title: "CIFI ORBIT — Mod Tree 입력값 관리",
    description: "Mod Tree Cultivator의 가중치와 진행도 입력값을 브라우저에서 안전하게 관리합니다.",
    openGraph: {
      title: "CIFI ORBIT — Mod Tree 입력값 관리",
      description: "ModValues 시트 기반 입력·검증·로컬 저장 프로토타입",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "CIFI ORBIT Unified Optimizer" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "CIFI ORBIT — Mod Tree 입력값 관리",
      description: "ModValues 시트 기반 입력·검증·로컬 저장 프로토타입",
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
