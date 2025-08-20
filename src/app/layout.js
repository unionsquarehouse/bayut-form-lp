import Navbar from "./components/Navbar";
import "./globals.css";

const APP_NAME = "Ghaf Woods";
const APP_DESCRIPTION =
  "Discover Ghaf Woods where luxury apartmens meet with nature! Click ghafwoods.com now to learn more about Majid Al Futtaim's new community!";
const APP_URL = "https://offplan.dubai-launch.com";
const APP_IMAGE = `${APP_URL}/assets/ghaf-woods-aerial-shot.jpg`;
import { GoogleTagManager } from "@next/third-parties/google";

export const metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Ghaf Woods",
    "Dubai",
    "Luxury Villas",
    "Waterfront Residences",
    "Townhouses",
    "Real Estate Dubai",
    "Nature Community",
    "Sustainable Living",
  ],
  applicationName: APP_NAME,
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [{ url: APP_IMAGE, width: 1200, height: 630, alt: APP_NAME }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [APP_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <GoogleTagManager gtmId="AW-17187290046" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        {/* <Navbar /> */}
        {children}
      </body>
    </html>
  );
}
