import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MaintenanceForm from "./pages/MaintenanceForm";
import VehicleHistory from "./pages/VehicleHistory";
import BuyerSearch from "./pages/BuyerSearch";
import WorkshopProfile from "./pages/WorkshopProfile";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";

import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              
              {/* Workshop only routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={["oficina"]}>
                    <PageWrapper><Dashboard /></PageWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/registar-servico" 
                element={
                  <ProtectedRoute allowedRoles={["oficina"]}>
                    <PageWrapper><MaintenanceForm /></PageWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/perfil-oficina" 
                element={
                  <ProtectedRoute allowedRoles={["oficina"]}>
                    <PageWrapper><WorkshopProfile /></PageWrapper>
                  </ProtectedRoute>
                } 
              />

              {/* Shared or Buyer routes */}
              <Route 
                path="/historico" 
                element={
                  <ProtectedRoute>
                    <PageWrapper><VehicleHistory /></PageWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consulta" 
                element={
                  <ProtectedRoute>
                    <PageWrapper><BuyerSearch /></PageWrapper>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/veiculos" 
                element={
                  <PageWrapper><Catalog /></PageWrapper>
                } 
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
