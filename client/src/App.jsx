import { Routes, Route, Outlet } from 'react-router-dom'
import { Navbar } from './components/app/Navbar'
import { Footer } from './components/app/Footer'
import { HomePage } from './pages/public/HomePage'
import { CatalogPage } from './pages/public/CatalogPage'
import { ProductDetailPage } from './pages/public/ProductDetailPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'
import { RoleSelectPage } from './pages/public/RoleSelectPage'
import { StoreDetailPage } from './pages/public/StoreDetailPage'
import { PrivateRoute, PublicRoute } from './routes/PrivateRoute'

import { BuyerDashboard } from './pages/dashboards/BuyerDashboard'
import { SellerDashboard } from './pages/dashboards/SellerDashboard'
import { DriverDashboard } from './pages/dashboards/DriverDashboard'
import { AdminDashboard } from './pages/dashboards/AdminDashboard'

import { CartPage } from './pages/buyer/CartPage'
import { CheckoutPage } from './pages/buyer/CheckoutPage'
import { OrderDetailPage } from './pages/buyer/OrderDetailPage'
import { BuyerReportPage } from './pages/buyer/BuyerReportPage'
import { AddressPage } from './pages/buyer/AddressPage'
import { OrdersPage } from './pages/buyer/OrdersPage'
import { WalletPage } from './pages/buyer/WalletPage'
import { SellerOrderDetailPage } from './pages/seller/SellerOrderDetailPage'
import { SellerReportPage } from './pages/seller/SellerReportPage'
import { DriverJobDetailPage } from './pages/driver/DriverJobDetailPage'

function Layout() {
  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/role-select"
          element={
            <PrivateRoute>
              <RoleSelectPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/buyer"
          element={
            <PrivateRoute role="buyer">
              <BuyerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/cart"
          element={
            <PrivateRoute role="buyer">
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/checkout"
          element={
            <PrivateRoute role="buyer">
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/orders/:id"
          element={
            <PrivateRoute role="buyer">
              <OrderDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/orders"
          element={
            <PrivateRoute role="buyer">
              <OrdersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/addresses"
          element={
            <PrivateRoute role="buyer">
              <AddressPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/wallet"
          element={
            <PrivateRoute role="buyer">
              <WalletPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller"
          element={
            <PrivateRoute role="seller">
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/orders/:id"
          element={
            <PrivateRoute role="seller">
              <SellerOrderDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/reports"
          element={
            <PrivateRoute role="seller">
              <SellerReportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/reports"
          element={
            <PrivateRoute role="buyer">
              <BuyerReportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/driver/jobs/:id"
          element={
            <PrivateRoute role="driver">
              <DriverJobDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <PrivateRoute role="driver">
              <DriverDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
