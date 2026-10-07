import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DevUi } from "./pages/DevUi";
import { Home } from "./pages/Home";
import { Planned } from "./pages/Planned";
import { Tickets } from "./pages/Tickets";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: true } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="devices" element={<Planned name="Devices" />} />
            <Route path="rma" element={<Planned name="Repairs" />} />
            <Route path="knowledge" element={<Planned name="Knowledge" />} />
            <Route path="reports" element={<Planned name="Reports" />} />
            <Route path="admin" element={<Planned name="Admin" />} />
            <Route path="dev/ui" element={<DevUi />} />
            <Route path="*" element={<Planned name="This page" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
