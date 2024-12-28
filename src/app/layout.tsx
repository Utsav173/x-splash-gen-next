import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUser } from "@/lib/db/queries";
import { UserProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Explore Collections | Next.js App",
  description:
    "Streamline your image collections with our Next.js app. Effortless management, secure storage, and seamless organization. Get started today!",
  keywords: [
    "image collection",
    "next.js app",
    "collection management",
    "image gallery",
  ],
  authors: [{ name: "Utsav Khatri" }],
  robots: "index, follow",
  openGraph: {
    title: "Image Explore Collections | Next.js App",
    description:
      "Streamline your image collections with our Next.js app. Effortless management, secure storage, and seamless organization. Get started today!",
    images: [
      {
        url: "/path_to_your_image.jpg",
        alt: "Image Explore Collections",
      },
    ],
    url: "https://x-image-gen.vercel.app",
    siteName: "Image Explore Collections",
  },
  twitter: {
    title: "Image Explore Collections | Next.js App",
    description:
      "Streamline your image collections with our Next.js app. Effortless management, secure storage, and seamless organization. Get started today!",
    images: ["/path_to_your_image.jpg"],
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userPromise = getUser();

  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        <UserProvider userPromise={userPromise}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col w-full h-full gap-4">
                {children}
              </div>
            </SidebarInset>
            <Toaster />
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  );
}
