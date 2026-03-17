import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppHeader from "@/components/AppHeader";
import PrivateRoute from "@/components/PrivateRoute";
import NewOrderPage from "@/pages/NewOrderPage";
import OrdersPage from "@/pages/OrdersPage";
import CustomersPage from "@/pages/CustomersPage";
import ProductsPage from "@/pages/ProductsPage";
import PedirPage from "@/pages/PedirPage";
import OrderTrackingPage from "@/pages/OrderTrackingPage";
import LojaPage from "@/pages/LojaPage";
import CadastroPage from "@/pages/CadastroPage";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/LoginPage";
import MesasPage from "@/pages/MesasPage";
import PedidoMesaPage from "@/pages/PedidoMesaPage";
import PedidoBalcaoPage from "@/pages/PedidoBalcaoPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col h-screen">
          <AppHeader />
          <main className="flex-1 overflow-hidden">
            <Routes>
              {/* Redireciona raiz para /mesas */}
              <Route path="/" element={<Navigate to="/mesas" replace />} />
              <Route path="/mesas" element={<MesasPage />} />
              <Route path="/mesa/:id" element={<PedidoMesaPage />} />
              <Route path="/balcao" element={<PedidoBalcaoPage />} />
              <Route path="/loja" element={<LojaPage />} />
              <Route path="/pedir" element={<PedirPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route path="/pedido/:id" element={<OrderTrackingPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* Rotas protegidas (mantidas para painel antigo) */}
              <Route element={<PrivateRoute />}>
                <Route path="/painel" element={<NewOrderPage />} />
                <Route path="/pedidos" element={<OrdersPage />} />
                <Route path="/clientes" element={<CustomersPage />} />
                <Route path="/produtos" element={<ProductsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
