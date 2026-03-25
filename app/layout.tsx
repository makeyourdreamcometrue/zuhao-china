import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "租好 - 租房更简单",
  description: "专业的租房管理平台，让房东和租客更轻松",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        
        <footer className="bg-gray-50 border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">租</span>
                  </div>
                  <span className="text-lg font-bold">租好</span>
                </div>
                <p className="text-sm text-gray-500">让租房更简单</p>
              </div>

              <div>
                <h4 className="font-medium mb-3">快速链接</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="/properties" className="hover:text-gray-900">浏览房源</a></li>
                  <li><a href="/about" className="hover:text-gray-900">关于我们</a></li>
                  <li><a href="/login" className="hover:text-gray-900">登录</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">法律信息</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="/terms" className="hover:text-gray-900">用户协议</a></li>
                  <li><a href="/privacy" className="hover:text-gray-900">隐私政策</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">联系我们</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>客服: 400-888-8888</li>
                  <li>邮箱: support@zuhao.com</li>
                  <li>工作时间: 9:00-18:00</li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-8 pt-8 text-center text-sm text-gray-400">
              © 2026 租好. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
