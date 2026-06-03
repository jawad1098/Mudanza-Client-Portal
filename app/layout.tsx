import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/ui/Toast"
import { LayoutClient } from "@/components/layout/LayoutClient"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mudanza Moving — Client Portal",
  description: "Client services portal",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FAFAFA]`}>
        <ToastProvider>
          <Suspense>
            <LayoutClient>{children}</LayoutClient>
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  )
}
