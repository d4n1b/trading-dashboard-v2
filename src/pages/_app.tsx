import type { AppProps } from "next/app";

import { Providers } from "@/providers";
import "@/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
