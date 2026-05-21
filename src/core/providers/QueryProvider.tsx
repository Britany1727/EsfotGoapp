import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
 
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:               1,           // Reintentar 1 vez si falla
      staleTime:           5 * 60*1000, // Datos frescos por 5 minutos
      refetchOnWindowFocus: true,       // Refetch al volver a la app
    },
    mutations: {
      retry: 0, // No reintentar mutaciones (login, register, etc.)
    },
  },
});
 
interface Props { children: ReactNode; }
 
export const QueryProvider = ({ children }: Props) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

