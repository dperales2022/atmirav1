import { useState, useEffect, useContext } from "react";
import Navbar from "./Navbar";
import { instrumentSans } from "../styles/fonts";
import { MendableFloatingButton } from "@mendable/search";
import AppNotificationContext from "../store/notification-context";
import Notification from "./components/ui/notification";

const style = { darkMode: false, accentColor: "#123456" };

const floatingButtonStyle = {
  color: "#fff",
  backgroundColor: "#157ba7",
};

export default function RootLayout({ children }) {
  const notificationCtx = useContext(AppNotificationContext);

  const activeNotification = notificationCtx.notification;

  return (
    <>
      <Navbar />
      <div className={`flex flex-row ${instrumentSans.className}`}>
        <div className="w-full md:w-3/4 p-8 relative">
          {/* Main content */}
          {children}
        </div>
        <MendableFloatingButton
          anon_key={process.env.NEXT_PUBLIC_ANON_KEY}
          style={style}
          floatingButtonStyle={floatingButtonStyle}
        />
        {activeNotification && (
          <Notification
            title={activeNotification.title}
            message={activeNotification.message}
            status={activeNotification.status}
          />
        )}
      </div>
    </>
  );
}
