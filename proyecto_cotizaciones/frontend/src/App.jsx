// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "@/styles/Home.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { AuthProvider } from "@/context/AuthContext.jsx";
import ProtectedRoute from "@/components/layout/ProtectedRoute.jsx";

// AUTH
import LoginPage from "@/auth/login/LoginPage.jsx";
import RegisterPage from "@/auth/register/RegisterPage.jsx";

// LAYOUT PRINCIPAL
import DashboardLayout from "@/dashboard/layout/DashboardLayout.jsx";
import GlobalNavbar from "@/dashboard/layout/GlobalNavbar.jsx";

// DASHBOARDS DE PRUEBA PARA COTIZACIONES
import CotizacionesHome from "./dashboard/Home/CotizacionesHome";
import AprobacionCotizacion from "@/dashboard/aprobacion_cotizacion/AprobacionCotizacion.jsx";
import GestionClientes from "./dashboard/gestion_clientes/GestionClientes";

// TABLAS
import EstructuraComercial from "./dashboard/Tablas/EstructuraComercial/EstructuraComercial";
import ParametrosVentas from "./dashboard/Tablas/ParametrosVentas/ParametrosVentas";
import CatalogoMarcas from "./dashboard/Tablas/CatalogoMarcas/CatalogoMarcas";
import GastosAnalisis from "./dashboard/Tablas/Gastos_Analisis/GastosAnalisis";

// MODAL NUEVA COTIZACIÓN
import CotizacionNuevaModal from "./dashboard/aprobacion_cotizacion/CotizacionNuevaModal";

import { KeyboardProvider } from "@/context/KeyboardContext.jsx";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <KeyboardProvider>

          <ToastContainer position="top-right" autoClose={3000} />

          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Home */}
              <Route path="cotizaciones-home" element={<CotizacionesHome />} />

              {/* Aprobación */}
              <Route
                path="aprobacion-cotizacion"
                element={<AprobacionCotizacion />}
              />

              {/* Nueva Cotización */}
              <Route
                path="cotizaciones/nueva"
                element={<CotizacionNuevaModal />}
              />

              {/* Estructura y Comercial */}
              <Route
                path="tablas/estructura"
                element={<EstructuraComercial />}
              />

              {/* Parámetros de Ventas */}
              <Route
                path="tablas/parametros"
                element={<ParametrosVentas />}
              />
              {/* Catálogo de Productos */}
              <Route
                path="tablas/catalogo"
                element={<CatalogoMarcas />}
              />
              {/* Clasificación de Gastos y Análisis */}
              <Route
                path="tablas/gastos"
                element={<GastosAnalisis />}
              />
            </Route>

            {/* Redirect */}
            <Route
              path="/"
              element={<Navigate to="/dashboard/aprobacion-cotizacion" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/dashboard/aprobacion-cotizacion" replace />}
            />
          </Routes>

        </KeyboardProvider>
      </AuthProvider>
    </Router>
  );
}
