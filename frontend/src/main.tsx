import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { DatesProvider } from "@mantine/dates";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { bootstrapAuthState } from "./store/authStore";
import { appTheme } from "./theme";

bootstrapAuthState();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light" theme={appTheme}>
      <Notifications position="top-right" zIndex={1000} />
      <DatesProvider settings={{ locale: "en" }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DatesProvider>
    </MantineProvider>
  </React.StrictMode>
);
