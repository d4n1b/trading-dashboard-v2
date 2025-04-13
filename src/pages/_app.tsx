import { Provider } from "react-redux";
import { Geist, Geist_Mono } from "next/font/google";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

import { sagaMiddleware, store } from "@/store/store";
import { rootSaga } from "@/store/sagas";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

sagaMiddleware.run(rootSaga);

function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </div>
  );
}

// Disable SSR for the entire app except API routes
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
