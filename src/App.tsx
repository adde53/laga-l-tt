import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SavedRecipes from "./pages/SavedRecipes";
import Admin from "./pages/Admin";
import Veckomeny from "./pages/Veckomeny";
import BilligaRecept from "./pages/BilligaRecept";
import MatladaBudget from "./pages/MatladaBudget";
import BilligVeckomatsedel from "./pages/BilligVeckomatsedel";
import BilligMat from "./pages/BilligMat";
import Unsubscribe from "./pages/Unsubscribe";
import VeckansMatfynd from "./pages/VeckansMatfynd";
import StoreOffers from "./pages/StoreOffers";
import BilligVeckomenyVecka from "./pages/BilligVeckomenyVecka";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/saved" element={<SavedRecipes />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/veckomeny" element={<Veckomeny />} />
            <Route path="/billiga-recept" element={<BilligaRecept />} />
            <Route path="/matlada-budget" element={<MatladaBudget />} />
            <Route path="/billig-veckomatsedel" element={<BilligVeckomatsedel />} />
            <Route path="/billig-mat" element={<BilligMat />} />
            <Route path="/avprenumerera" element={<Unsubscribe />} />
            <Route path="/veckans-matfynd" element={<VeckansMatfynd />} />
            <Route path="/billig-veckomeny/:week" element={<BilligVeckomenyVecka />} />
            <Route path="/ica-erbjudanden" element={<StoreOffers chain="ica" />} />
            <Route path="/willys-erbjudanden" element={<StoreOffers chain="willys" />} />
            <Route path="/hemkop-erbjudanden" element={<StoreOffers chain="hemkop" />} />
            <Route path="/lidl-erbjudanden" element={<StoreOffers chain="lidl" />} />
            <Route path="/coop-erbjudanden" element={<StoreOffers chain="coop" />} />
            <Route path="/citygross-erbjudanden" element={<StoreOffers chain="citygross" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
