import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
