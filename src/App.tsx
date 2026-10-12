import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import { ResumenPage } from './pages/ResumenPage'
import { DashboardPage } from './pages/DashboardPage'
import { TransaccionesPage } from './pages/TransaccionesPage'
import { PresupuestosPage } from './pages/PresupuestosPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ResumenPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="transacciones" element={<TransaccionesPage />} />
            <Route path="presupuestos" element={<PresupuestosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
