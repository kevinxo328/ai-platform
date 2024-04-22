import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { queryClient } from "./libs/reactQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Theme, ThemeProvider } from "./contexts/ui-theme";

if (import.meta.env.MODE === "development") {
  console.log(import.meta.env);
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ThemeProvider
    defaultTheme={(import.meta.env.VITE_APP_DEFAULT_THEME as Theme) || "dark"}
    storageKey="ui-theme"
  >
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ThemeProvider>
);
