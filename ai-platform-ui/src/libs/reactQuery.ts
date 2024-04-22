import { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import { AxiosError } from "axios";

// Extend the Register interface to add a defaultError property
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AxiosError<{ detail: string }>;
  }
}

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
};

export const queryClient = new QueryClient(queryClientConfig);
