import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import "./globals.css";
import theme from "@/app/theme";
import { ThemeProvider } from "@mui/material";

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1.0,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Redis Pixel War',
  description: "A competitive, real-time pixel territory game powered by Redis.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en">
  <body>
  <AppRouterCacheProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme/>
      {children}
    </ThemeProvider>
  </AppRouterCacheProvider>
  </body>
  </html>
);
export default RootLayout
