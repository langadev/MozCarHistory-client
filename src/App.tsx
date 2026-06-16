import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WorkshopLayout from "@/components/layout/WorkshopLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MaintenanceForm from "./pages/MaintenanceForm";
import VehicleHistory from "./pages/VehicleHistory";
import BuyerSearch from "./pages/BuyerSearch";
import WorkshopProfile from "./pages/WorkshopProfile";
import Catalog from "./pages/Catalog";
import CarForm from "./pages/CarForm";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWorkshops from "./pages/admin/AdminWorkshops";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminWorkshopDetail from "./pages/admin/AdminWorkshopDetail";
import WorkshopMechanics from "./pages/WorkshopMechanics";
import WorkshopVehicles from "./pages/WorkshopVehicles";
import WorkshopRecords from "./pages/WorkshopRecords";
import Messages from "./pages/Messages";
import AdminMessages from "./pages/admin/AdminMessages";
import MechanicDashboard from "./pages/mecanico/MechanicDashboard";
import MechanicServiceForm from "./pages/mecanico/MechanicServiceForm";
import ChangePassword from "./pages/ChangePassword";
import MechanicLayout from "@/components/layout/MechanicLayout";
import RequirePasswordChange from "@/components/auth/RequirePasswordChange";

import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import AdminRoute from "@/components/auth/AdminRoute";

const queryClient = new QueryClient();

// Paths that always use WorkshopLayout (oficina-only)
const WORKSHOP_OWNED = ["/dashboard", "/registar-viatura", "/registar-servico", "/perfil-oficina", "/mecanicos", "/minhas-viaturas", "/meus-registos", "/mensagens"];
// Paths that always use MechanicLayout
const MECHANIC_OWNED = ["/mecanico/dashboard", "/mecanico/registar-servico"];
// Public paths that oficina users should also see with the sidebar
const WORKSHOP_SHARED = ["/veiculos", "/consulta", "/historico"];

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

// For public pages: oficina users get WorkshopLayout, everyone else gets plain content
const SmartPublicPage = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role === "oficina") {
    return (
      <WorkshopLayout>
        <PageWrapper>{children}</PageWrapper>
      </WorkshopLayout>
    );
  }
  return <PageWrapper>{children}</PageWrapper>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = location.pathname.startsWith("/admin");
  const isWorkshopOwned = WORKSHOP_OWNED.includes(location.pathname);
  const isMechanicOwned = MECHANIC_OWNED.some(p => location.pathname.startsWith(p));
  const isAlterSenha = location.pathname === "/alterar-senha";
  const isWorkshopShared = user?.role === "oficina" && WORKSHOP_SHARED.includes(location.pathname);

  if (isAdmin || isWorkshopOwned || isMechanicOwned || isAlterSenha || isWorkshopShared) return <>{children}</>;

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">{children}</AnimatePresence>
      <Footer />
    </>
  );
};

const WorkshopRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["oficina"]}>
    <WorkshopLayout>
      <PageWrapper>{children}</PageWrapper>
    </WorkshopLayout>
  </ProtectedRoute>
);

const MechanicRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute allowedRoles={["mecanico"]}>
    <RequirePasswordChange>
      <MechanicLayout>
        <PageWrapper>{children}</PageWrapper>
      </MechanicLayout>
    </RequirePasswordChange>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
          <MainLayout>
            <Routes>
              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/utilizadores" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/oficinas" element={<AdminRoute><AdminWorkshops /></AdminRoute>} />
              <Route path="/admin/viaturas" element={<AdminRoute><AdminVehicles /></AdminRoute>} />
              <Route path="/admin/oficinas/:id" element={<AdminRoute><AdminWorkshopDetail /></AdminRoute>} />
              <Route path="/admin/mensagens" element={<AdminRoute><AdminMessages /></AdminRoute>} />

              {/* Workshop routes — sidebar layout */}
              <Route path="/dashboard" element={<WorkshopRoute><Dashboard /></WorkshopRoute>} />
              <Route path="/registar-viatura" element={<WorkshopRoute><CarForm /></WorkshopRoute>} />
              <Route path="/registar-servico" element={<WorkshopRoute><MaintenanceForm /></WorkshopRoute>} />
              <Route path="/perfil-oficina" element={<WorkshopRoute><WorkshopProfile /></WorkshopRoute>} />
              <Route path="/mecanicos" element={<WorkshopRoute><WorkshopMechanics /></WorkshopRoute>} />
              <Route path="/minhas-viaturas" element={<WorkshopRoute><WorkshopVehicles /></WorkshopRoute>} />
              <Route path="/meus-registos" element={<WorkshopRoute><WorkshopRecords /></WorkshopRoute>} />
              <Route path="/mensagens" element={<WorkshopRoute><Messages /></WorkshopRoute>} />

              {/* Mechanic routes */}
              <Route path="/mecanico/dashboard" element={<MechanicRoute><MechanicDashboard /></MechanicRoute>} />
              <Route path="/mecanico/registar-servico" element={<MechanicRoute><MechanicServiceForm /></MechanicRoute>} />

              {/* Change password — any authenticated user */}
              <Route path="/alterar-senha" element={<ProtectedRoute allowedRoles={["mecanico", "oficina", "comprador", "admin"]}><PageWrapper><ChangePassword /></PageWrapper></ProtectedRoute>} />

              {/* Public routes */}
              <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <PageWrapper><Login /></PageWrapper>
                  </PublicRoute>
                }
              />

              {/* Shared public pages — sidebar for oficina, Navbar for everyone else */}
              <Route path="/historico" element={<SmartPublicPage><VehicleHistory /></SmartPublicPage>} />
              <Route path="/consulta" element={<SmartPublicPage><BuyerSearch /></SmartPublicPage>} />
              <Route path="/veiculos" element={<SmartPublicPage><Catalog /></SmartPublicPage>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
