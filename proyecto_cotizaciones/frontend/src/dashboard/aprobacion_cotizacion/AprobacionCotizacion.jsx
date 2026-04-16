// frontend/src/dashboard/aprobacion_cotizacion/AprobacionCotizacion.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { BriefcaseBusiness, FilePlus, Eye, TrendingUp, DollarSign, BarChart3, Filter, Loader, PieChart, Calculator, FileSpreadsheet, Wallet2, Landmark, Scale, Coins, User, MoreHorizontal, ClipboardCheck, LayoutDashboard , History, Globe, ListTodo, Layout, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Table from "@/components/ui/table";
import KpiCard from "@/components/ui/KpiCard";
import FilterCard from "@/components/ui/FilterCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { getEnvioColor, getEnvioNombre, ENVIO_STATE_COLORS, getEnvioLabel, envioMap } from "@/components/ui/colors";
import AprobacionCotizacionModal from "@/dashboard/aprobacion_cotizacion/AprobacionCotizacionModal.jsx";
import { useNavigate } from "react-router-dom";
import CotizacionNuevaModal from "./CotizacionNuevaModal";
import TablaCoti from "../../components/TablaCoti";
import TablaHistorial from "../../components/TablaHistorial";
import TablaOportunidades from "../../components/TablaOportunidades";
import KpisCotizaciones from "../../components/KpisCotizaciones";
import OportunidadesModal from "./OportunidadesModal";

const fetchCotizacionesAprobacion = async ({ queryKey }) => {
  const [_key, params, tab] = queryKey;

  const token = localStorage.getItem("access_token");

  let nombUsuario = null;

  // 🔥 SOLO cuando estamos en MIS COTIZACIONES
  if (tab === "mis_cotizaciones") {
    const usuarioRes = await api.get("usuario-actual/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    nombUsuario = usuarioRes.data?.usuario_usu
      ?.trim()
      ?.toUpperCase();
  }

  const { data } = await api.get(
    "cotizaciones/aprobacion_cotizacion",
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    }
  );

  const tabla = Array.isArray(data?.tabla) ? data.tabla : [];
  const dashboard = data?.dashboard || {};

  let dataLimpia = tabla.map(item => ({
    ...item,
    cliente: item.cliente?.trim() || "-",
    area: item.area?.trim() || "-",
    estado: item.estado?.trim() || "-",
  }));

  // 🔥 FILTRO
  if (tab === "mis_cotizaciones" && nombUsuario) {
    dataLimpia = dataLimpia.filter(
      i => i.regus?.trim()?.toUpperCase() === nombUsuario
    );
  }

  return {
    cotizaciones: dataLimpia,
    stats: dashboard,
  };
};

const fetchOportunidadesDashboard = async ({ queryKey }) => {
  const [_key, params, tab] = queryKey;
  const token = localStorage.getItem("access_token");
  let nombUsuario = null;

  // 1. Obtener usuario si estamos en la pestaña personal
  if (tab === "mis_oportunidades") {
    const usuarioRes = await api.get("usuario-actual/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    nombUsuario = usuarioRes.data?.usuario_usu?.trim()?.toUpperCase();
  }

  // 2. Llamada al nuevo endpoint que creamos
  const { data } = await api.get(
    "cotizaciones/oportunidades", 
    {
      headers: { Authorization: `Bearer ${token}` },
      params, // Aquí viajan anno, mes, etc.
    }
  );

  const tabla = Array.isArray(data?.tabla) ? data.tabla : [];
  const dashboard = data?.dashboard || {};

  // 3. Limpieza de datos (Data Mapping)
  let dataLimpia = tabla.map(item => ({
    ...item,
    nombr: item.nombr?.trim() || "S/N",
    area_nombre: item.area_nombre || "OTRO",
    estado_nombre: item.estado_nombre || "PENDIENTE",
  }));

  // 4. Filtro de seguridad por usuario en el cliente
  if (tab === "mis_oportunidades" && nombUsuario) {
    dataLimpia = dataLimpia.filter(
      i => i.regus?.trim()?.toUpperCase() === nombUsuario
    );
  }

  return {
    oportunidades: dataLimpia,
    stats: dashboard,
  };
};

export default function AprobacionCotizacion() {
  const { authUser: user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const usuarioActual = user?.usuario_usu || "";
  const [filtro, setFiltro] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [oportunidadSeleccionada, setOportunidadSeleccionada] = useState(null);
  const [detalleOportunidadOpen, setDetalleOportunidadOpen] = useState(false);
  const navigate = useNavigate();
  const [openNueva, setOpenNueva] = useState(false);
  const [annoActual, setAnnoActual] = useState(new Date().getFullYear()); // año actual por defecto
  const [processingFilters, setProcessingFilters] = useState(false);
  const filtrosDefault = {
    anno: new Date().getFullYear(),
    mes: "%", cliente: "%", estado: "%", area: "%", envio: "%",
    num_reg: "", campo: "", valor: "",
    generalCampo: "", generalValor: "",
    index: 1, num_regs: 10,
  };

  const [filtersByTab, setFiltersByTab] = useState({
    cotizaciones: filtrosDefault,
    mis_cotizaciones: filtrosDefault,
    resumen: filtrosDefault,
  });

  const [tabActiva, setTabActiva] = useState("cotizaciones");
  const currentFilters = filtersByTab[tabActiva] || filtrosDefault;
  // ── QUERY 1: COTIZACIONES ──────────────────────────────────
  const {
    data: dataCotiz,
    isLoading: isLoadingCotiz,
    isFetching: isFetchingCotiz,
    error: errorCotiz,
  } = useQuery({
    queryKey: ["aprobacion-cotizaciones", currentFilters, tabActiva],
    queryFn: fetchCotizacionesAprobacion,
    keepPreviousData: true,
    enabled: tabActiva.includes("cotizacion") || tabActiva === "resumen"
  });
  const cotizaciones = dataCotiz?.cotizaciones || [];
  const stats = dataCotiz?.stats || {};
  //const cotizaciones = data?.cotizaciones || [];
  //const stats = data?.stats || {};

  // ── QUERY 2: OPORTUNIDADES ─────────────────────────────────
  const { 
    data: dataOp, 
    isLoading: isLoadingOp, 
    isFetching: isFetchingOp 
  } = useQuery({
    // Usamos currentFilters.anno y currentFilters.mes que ya vienen del estado por pestaña
    queryKey: ["oportunidades", { anno: currentFilters.anno, mes: currentFilters.mes }, tabActiva],
    queryFn: fetchOportunidadesDashboard,
    keepPreviousData: true,
    enabled: tabActiva.includes("oportunidades")
  });

  const oportunidades = dataOp?.oportunidades || [];
  const statsOp = dataOp?.stats || {};
  // Unificamos estados para la UI (Evita el ReferenceError)
  const isFetching = isFetchingCotiz || isFetchingOp;
  const isLoading = isLoadingCotiz || isLoadingOp;

  const [clientesMap, setClientesMap] = useState({});
  const queryClient = useQueryClient();

  // ── LÓGICA DE FILTRADO (MEMO) ──────────────────────────────
  const cotizacionesFiltradas = useMemo(() => {
    let data = [...cotizaciones];
    if (tabActiva === "mis_cotizaciones" && usuarioActual) {
      data = data.filter(c => c.regus?.trim().toUpperCase() === usuarioActual.trim().toUpperCase());
    }
    data = data.filter(c => {
      const pasaEstado = filtro === "Todos" || c.estado_nombre === filtro;
      const pasaFecha = (!fechaInicio || new Date(c.cotif) >= new Date(fechaInicio)) &&
                        (!fechaFin || new Date(c.cotif) <= new Date(fechaFin));
      return pasaEstado && pasaFecha;
    });
    return data.sort((a, b) => new Date(b.cotif) - new Date(a.cotif));
  }, [cotizaciones, filtro, fechaInicio, fechaFin, tabActiva, usuarioActual]);

  const oportunidadesFiltradas = useMemo(() => {
    let data = [...oportunidades];
    if (tabActiva === "mis_oportunidades" && usuarioActual) {
      data = data.filter(o => o.regus?.trim().toUpperCase() === usuarioActual.trim().toUpperCase());
    }
    data = data.filter(o => {
      const pasaEstado = filtro === "Todos" || o.estado_nombre === filtro;
      const pasaFecha = (!fechaInicio || new Date(o.f_recp) >= new Date(fechaInicio)) &&
                        (!fechaFin || new Date(o.f_recp) <= new Date(fechaFin));
      return pasaEstado && pasaFecha;
    });
    return data.sort((a, b) => new Date(b.f_recp) - new Date(a.f_recp));
  }, [oportunidades, filtro, fechaInicio, fechaFin, tabActiva, usuarioActual]);

  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.25]);
  const blurValue = useTransform(scrollY, [0, 100], [4, 8]);






  // Mapeo  de Clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const res = await api.get("/cotizaciones/clientes/");
      const map = {};
      res.data.forEach(c => {
        map[c.codigo] = c.nombre;
      });
      setClientesMap(map);
    };

    fetchClientes();
  }, []);

  // =========
  // REPORTE
  // =========
  const windowsOpen = (url, alto = 980, ancho = 600) => {
    const left = (screen.width - alto) / 2;
    const top = (screen.height - ancho) / 2;

    const specs = `resizable=yes,location=1,status=1,scrollbars=yes,width=${alto},height=${ancho},top=${top},left=${left}`;

    const popup = window.open(url, "reporte", specs);
    if (popup) popup.focus();
  };

  // ----------------------------------------------------
  // 📊 Reporte Cotizaciones por Área (Dashboard)
  // ----------------------------------------------------
  const handleReport = (filters) => {
    if (!filters) return;

    const params = {
      anno: filters.anio || annoActual,
      mes: filters.mes || "%",
      estado: filters.estado || "%",
      cliente: filters.cliente || "%",
      area: filters.area || "%",
      campo: filters.generalCampo || "",
      valor: filters.generalValor || "",
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const query = new URLSearchParams(params).toString();

    windowsOpen(
      `${API_URL}/cotizaciones/reportes/reporte_cotizaciones_dashboard_html/?${query}`,
      980,
      600
    );
  };

  // ===========
  // GRAFICOS
  // ===========
  const estados = useMemo(() => {
    if (!cotizaciones.length) return [];

    return Object.values(
      cotizaciones.reduce((acc, c) => {
        const codigo = Number(c.envio);

        if (!acc[codigo]) {
          acc[codigo] = {
            codigo,
            estado: getEnvioLabel(codigo),
            cantidad: 0,
            color: getEnvioColor(codigo),
          };
        }

        acc[codigo].cantidad++;
        return acc;
      }, {})
    );
  }, [cotizaciones]);

  const porArea = useMemo(() => {
    if (!cotizaciones.length) return [];

    const counts = cotizaciones.reduce((acc, c) => {
      // Ajusta 'c.area' al nombre exacto de la propiedad de tu API
      const areaName = c.area_nombre || "Sin Área"; 
      acc[areaName] = (acc[areaName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([area, cantidad]) => ({
      area,
      cantidad
    })).sort((a, b) => b.cantidad - a.cantidad); // Ordenar de mayor a menor
  }, [cotizaciones]);

  const porProbabilidad = useMemo(() => {
    if (!cotizaciones.length) return [];

    const counts = [
      { label: "Baja", cantidad: 0, color: "#ff0505", key: "baja" },
      { label: "Media", cantidad: 0, color: "#fce005", key: "media" },
      { label: "Alta", cantidad: 0, color: "#0ea5e9", key: "alta" },
      { label: "Muy Alta", cantidad: 0, color: "#22c55e", key: "muy_alta" },
    ];

    cotizaciones.forEach((c) => {
      const p = Number(c.prob);

      switch (p) {
        case 0:
          counts[0].cantidad++;
          break;
        case 1:
          counts[1].cantidad++;
          break;
        case 2:
          counts[2].cantidad++;
          break;
        case 3:
          counts[3].cantidad++;
          break;
      }
    });

    return counts;
  }, [cotizaciones]);

  const proximosVencimientos = useMemo(() => {
    const hoy = new Date();

    return cotizaciones
      .map((c) => {
        const diasValidez = Number(c.valid) || 0;
        const unidad = c.acu_s;

        let totalDias = diasValidez;
        if (unidad === "S") totalDias *= 7;
        if (unidad === "M") totalDias *= 30;

        // 🔹 Fecha de creación
        const fechaCreacion = new Date(c.fecha);

        // 🔹 Fecha de vencimiento real
        const fechaVencimiento = new Date(fechaCreacion);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + totalDias);

        // 🔹 Días restantes reales
        const diasRestantes = Math.ceil(
          (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
        );

        return {
          ...c,
          diasRestantes,
          prioridad:
            diasRestantes <= 2
              ? "URGENTE"
              : diasRestantes <= 5
              ? "PRÓXIMO"
              : "NORMAL",
        };
      })
      .filter((c) => c.diasRestantes <= 7 && c.diasRestantes >= 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [cotizaciones]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col bg-white font-sans"
    >
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <motion.div
          style={{
            boxShadow: shadowOpacity.get() > 0 ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
            backdropFilter: `blur(${blurValue.get()}px)`,
          }}
          className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 pt-4 flex flex-col gap-1"
        >

          {/* TOP */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* IZQUIERDA */}
            <div className="flex-1 min-w-0">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                <span className="hover:text-cyan-600 cursor-pointer transition-colors">Comercial</span>
                <span>/</span>
                <span>Cotizaciones</span>
              </nav>

              {/* Título */}
              <div className="flex items-center gap-2">
                <div className="bg-cyan-600/10 text-cyan-700 w-7 h-7 rounded-md flex items-center justify-center shrink-0">
                  <BriefcaseBusiness className="w-4 h-4" />
                </div>

                <h1 className="text-lg font-semibold text-slate-800 tracking-tight truncate">
                  Cotizaciones
                </h1>
              </div>
            </div>


            {/* ACCIONES DINÁMICAS */}
            <div className="flex items-center gap-2">

              <Button
                onClick={() => setOpenNueva(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium px-4 h-8 rounded-md flex items-center gap-2 shadow-sm transition"
              >
                <FilePlus size={14} />
                Nueva
              </Button>

              <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* SUBNAV ESTILO JIRA */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar">
            {[
              { id: "resumen", label: "Resumen", icon: <Globe size={16} /> },
              { id: "oportunidades", label: "Oportunidades", icon: <Layout size={16} /> },
              { id: "cotizaciones", label: "Cotizaciones", icon: <ListTodo size={16} /> },
              { id: "historial", label: "Historial", icon: <History size={16} /> },
            ].map((tab) => {
              const isActive = tabActiva === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 pb-3 text-sm font-medium transition-all outline-none ${
                    isActive 
                      ? "text-cyan-600" 
                      : "text-slate-600 hover:bg-slate-50 rounded-t-sm"
                  }`}
                >
                  {/* Icono con color dinámico */}
                  <span className={`${isActive ? "text-cyan-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {tab.icon}
                  </span>
                  
                  <span>{tab.label}</span>

                  {/* Indicador Activo (Línea azul de Jira) */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-cyan-600 rounded-t-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
            
            {/* Botón "+" de Jira para añadir más tabs */}
            <button className="p-1.5 mb-2 ml-1 text-slate-500 hover:bg-slate-100 rounded transition-colors">
              <Plus size={18} />
            </button>
          </div>
        </motion.div>

        {/* CONTENIDO DINÁMICO */}
        <div className="flex-1 min-h-0 overflow-hidden">
          
          {tabActiva === "resumen" && (
            <div className="h-full overflow-y-auto p-6 custom-scrollbar">
              <KpisCotizaciones 
                stats={stats}
                estados={estados}
                porArea={porArea}
                porProbabilidad={porProbabilidad}
                proximosVencimientos={proximosVencimientos}
                isFetching={isFetching}
              />
            </div>
          )}

          {tabActiva === "cotizaciones" && (
            <div className="h-full flex flex-col p-6 pb-2">
              <TablaCoti
                data={cotizacionesFiltradas}
                clientesMap={clientesMap}
                isFetching={isFetching}
                onRowClick={(c) => {
                  setCotizacionSeleccionada(c);
                  setDetalleOpen(true);
                }}
                getEnvioColor={getEnvioColor}
                getEnvioNombre={getEnvioNombre}
                activeFiltersCount={Object.values(currentFilters).filter(v => 
                  v !== "%" && v !== "" && v !== annoActual
                ).length}
                onClearFilters={() =>
                  setFiltersByTab(prev => ({
                    ...prev,
                    cotizaciones: filtrosDefault,
                  }))
                }
                filterComponent={
                  <FilterCard
                    dashboard="aprobacion-cotizaciones"
                    className="w-full bg-transparent shadow-none border-none p-0"
                    compact
                    processing={processingFilters}
                    onReport={handleReport}
                    onProcess={async (filters, event) => {
                      if (event) event.preventDefault();
                      setProcessingFilters(true);
                      try {
                        const params = {
                          anno: filters.anio || annoActual,
                          mes: filters.mes || "%",
                          cliente: filters.cliente || "%",
                          estado: filters.estado || "%",
                          area: filters.area || "%",
                          envio: filters.envio || "%",
                          ...(filters.campo && filters.valor ? { campo: filters.campo, valor: filters.valor } : {}),
                          ...(filters.fechaInicio ? { fechaInicio: filters.fechaInicio } : {}),
                          ...(filters.fechaFin ? { fechaFin: filters.fechaFin } : {}),
                        };
                        setFiltersByTab(prev => ({ ...prev, cotizaciones: { ...prev.cotizaciones, ...params } }));
                      } finally {
                        setProcessingFilters(false);
                      }
                    }}
                  />
                }
              />
            </div>
          )}

          {tabActiva === "oportunidades" && (
            <div className="h-full flex flex-col p-6 pb-2">
              <TablaOportunidades
                data={oportunidadesFiltradas}
                isFetching={isFetching}
                onRowClick={(o) => {
                  setOportunidadSeleccionada(o);
                  setDetalleOportunidadOpen(true);
                }}
                activeFiltersCount={Object.values(currentFilters).filter(v => 
                  v !== "%" && v !== "" && v !== annoActual
                ).length}
                onClearFilters={() =>
                  setFiltersByTab(prev => ({
                    ...prev,
                    oportunidades: filtrosDefault,
                  }))
                }
                filterComponent={
                  <FilterCard
                    dashboard="gestion-oportunidades"
                    className="w-full bg-transparent shadow-none border-none p-0"
                    compact
                    processing={processingFilters}
                    onReport={handleReport}
                    onProcess={async (filters, event) => {
                      if (event) event.preventDefault();
                      setProcessingFilters(true);
                      try {
                        const params = {
                          anno: filters.anio || annoActual,
                          mes: filters.mes || "%",
                          cliente: filters.cliente || "%",
                          estado: filters.estado || "%",
                          area: filters.area || "%",
                          // En oportunidades quizás no usas 'envio', pero mantenemos la estructura
                          ...(filters.campo && filters.valor ? { campo: filters.campo, valor: filters.valor } : {}),
                          ...(filters.fechaInicio ? { fechaInicio: filters.fechaInicio } : {}),
                          ...(filters.fechaFin ? { fechaFin: filters.fechaFin } : {}),
                        };
                        setFiltersByTab(prev => ({ ...prev, oportunidades: { ...prev.oportunidades, ...params } }));
                      } finally {
                        setProcessingFilters(false);
                      }
                    }}
                  />
                }
              />
            </div>
          )}

          {tabActiva === "historial" && (
            <div className="h-full p-6">
              <TablaHistorial />
            </div>
          )}
        </div>

        {/* MODAL */}
        <CotizacionNuevaModal
          open={openNueva}
          onClose={() => setOpenNueva(false)}
          modo="A"
          tipo="N"
          dashboard="C"
          cotizaciones={cotizaciones}
          esOportunidad={tabActiva.includes("oportunidades")}
        />

        {cotizacionSeleccionada && (
          <AprobacionCotizacionModal
            key={cotizacionSeleccionada.num_reg}
            open={detalleOpen}
            onClose={() => setDetalleOpen(false)}
            cotizacion={cotizacionSeleccionada}
            modo="A"
            tipo="V"
            dashboard="C"
            esOportunidad={tabActiva.includes("oportunidades")}
          />
        )}

        {oportunidadSeleccionada && (
          <AprobacionCotizacionModal
            key={`op-${oportunidadSeleccionada.num_reg || oportunidadSeleccionada.id}`} 
            open={detalleOportunidadOpen}
            onClose={() => {
              setDetalleOportunidadOpen(false);
              setOportunidadSeleccionada(null); // Limpiamos el estado
            }}
            // IMPORTANTE: Pasamos la oportunidad como 'cotizacion' 
            // porque el modal espera ese nombre de prop
            cotizacion={oportunidadSeleccionada} 
            modo="A"
            tipo="V"
            dashboard="O"
            esOportunidad={true} // <--- Aquí forzamos que se vea la fila de seguimiento
          />
        )}
      </div>
    </motion.div>
  );
}
