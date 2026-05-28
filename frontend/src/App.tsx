import { Routes, Route } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StoreExplorerPage from "./pages/StoreExplorerPage";
import StoreDetailPage from "./pages/StoreDetailPage";
import CustomerOrdersPage from "./pages/CustomerOrdersPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import DeliveryBoardPage from "./pages/DeliveryBoardPage";
import InventoryManagerPage from "./pages/InventoryManagerPage";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="stores" element={<StoreExplorerPage />} />
          <Route path="stores/:storeId" element={<StoreDetailPage />} />
          <Route
            path="orders"
            element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <CustomerOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/dashboard"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="owner/stores/:storeId"
            element={
              <ProtectedRoute roles={["OWNER", "ADMIN"]}>
                <InventoryManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="delivery"
            element={
              <ProtectedRoute roles={["DELIVERY", "ADMIN"]}>
                <DeliveryBoardPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
