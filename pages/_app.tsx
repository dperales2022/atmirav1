import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RootLayout from "./layout";
import { UserContextProvider } from "../store/Contextinfo";
import { AppNotificationContextProvider } from "../store/notification-context";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppNotificationContextProvider>
      <UserContextProvider>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </UserContextProvider>
    </AppNotificationContextProvider>
  );
}
