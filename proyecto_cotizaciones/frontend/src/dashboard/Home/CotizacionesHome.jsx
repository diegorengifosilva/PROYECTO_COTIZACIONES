// frontend/src/dashboard/aprobacion_cotizacion/AprobacionCotizacion.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { BriefcaseBusiness, FilePlus, Eye, TrendingUp, DollarSign, BarChart3, Filter, Loader, Calculator, FileSpreadsheet, Wallet2, Landmark, Scale, Coins, User, MoreHorizontal, ClipboardCheck, LayoutDashboard , History, Globe, ListTodo, Layout, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Table from "@/components/ui/table";
import KpiCard from "@/components/ui/KpiCard";
import FilterCard from "@/components/ui/FilterCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { getEnvioColor, getEnvioNombre, ENVIO_STATE_COLORS } from "@/components/ui/colors";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import DashboardBoard from "../board/DashboardBoard";
import TablaCoti from "../../components/TablaCoti";
import TablaHistorial from "../../components/TablaHistorial";
import KpisCotizaciones from "../../components/KpisCotizaciones";
import ResumenFilters from "../Home/resumen/ResumenFilters";
import SemaforoCumplimiento from "../Home/resumen/SemaforoCumplimiento";
import KpisResumen from "../Home/resumen/KpisResumen";
import AlertasPanel from "../Home/resumen/AlertasPanel";
import TendenciasCharts from "../Home/resumen/TendenciasCharts";
import AnalisisComercial from "../Home/analisis/AnalisisDashboard";
import GraficoDinamico from "./analisis/GraficoDinamico";

export default function CotizacionesHome() {
  const { authUser: user, logout } = useAuth();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [clientes, setClientes] = useState([]);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const navigate = useNavigate();
  const [openNueva, setOpenNueva] = useState(false);
  const [annoActual, setAnnoActual] = useState(new Date().getFullYear()); // año actual por defecto
  const [processingFilters, setProcessingFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    anno: new Date().getFullYear(), // año actual
    mes: "%",                        // todos los meses por defecto
    cliente: "%",                    // todos los clientes
    estado: "%",                     // todos los estados
    area: "%",                        // todas las áreas
    envio: "%",                       // todos los envíos
    num_reg: "",                      // opcional: número de registro específico
    campo: "",                        // campo específico para búsqueda flexible
    valor: "",                        // valor para el campo específico
    generalCampo: "",                 // búsqueda general tipo CAJA CHICA
    generalValor: "",                 // valor de búsqueda general
    index: 1,                         // página actual si implementas paginación
    num_regs: 10,                     // cantidad de registros por página
  });
  const [clientesMap, setClientesMap] = useState({});
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["cotizaciones", currentFilters],
    queryFn: () => fetchCotizaciones(currentFilters),
    keepPreviousData: true,
  });
  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.25]);
  const blurValue = useTransform(scrollY, [0, 100], [4, 8]);
  
  const [tabActiva, setTabActiva] = useState("resumen");
  const [areas, setAreas] = useState([]);

  // Fetch cotizaciones con filtro por año actual
  const fetchCotizaciones = useCallback(async (params = { anno: annoActual }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await api.get("cotizaciones/aprobacion_cotizacion", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const tabla = Array.isArray(data?.tabla) ? data.tabla : [];
      const dashboard = data?.dashboard || {};

      const dataLimpia = tabla.map((item) => ({
        ...item,
        cliente: item.cliente?.trim() || "-",
        area: item.area?.trim() || "-",
        estado: item.estado?.trim() || "-",
      }));

      dataLimpia.sort((a, b) => {
        const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
        const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
        if (fechaB - fechaA !== 0) return fechaB - fechaA;
        return (b.numero || "").localeCompare(a.numero || "");
      });

      setCotizaciones(dataLimpia);
      setStats(dashboard);
    } catch (e) {
      console.error("Error cargando cotizaciones:", e);
      if (e?.response?.status === 401) logout();
      toast.error("Error cargando las cotizaciones.");
    } finally {
      setLoading(false);
    }
  }, [annoActual, logout]);

  // Obtener año actual desde la API cont_cias
  const fetchAnnoActual = async () => {
    try {
      const res = await api.get("cont_cias/001/"); // endpoint que devuelve cont_cias.cod=001
      if (res.data?.anno) setAnnoActual(res.data.anno);
      fetchCotizaciones(res.data?.anno);
    } catch (err) {
      console.warn("No se pudo obtener año actual, se usa el año del sistema", err);
      fetchCotizaciones(annoActual);
    }
  };

  // ==========================
  // CARGAR AREAS
  // ==========================
  useEffect(() => {
    if (!open) return;

    api.get("cotizaciones/areas/")
      .then(res => setAreas(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAreas([]));
  }, [open]);

  // ===========
  // CLIENTES
  // ===========
  useEffect(() => {
      const fetchClientes = async () => {
          const res = await api.get("/cotizaciones/clientes/");
          setClientes(res.data);
      };
      fetchClientes();
  }, []);

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

  useEffect(() => {
    if (!user) return;
    fetchAnnoActual();
  }, [user]);

  // Efecto scroll flotante
  useEffect(() => {
    const onScroll = () => {
      shadowOpacity.set(Math.min(window.scrollY / 150, 0.2));
      blurValue.set(Math.min(window.scrollY / 100, 8));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [shadowOpacity, blurValue]);

  const cotizacionesFiltradas = cotizaciones
    .filter((c) => {
      const pasaEstado = filtro === "Todos" || c.estado_nombre === filtro;
      const pasaFecha =
        (!fechaInicio || new Date(c.cotif) >= new Date(fechaInicio)) &&
        (!fechaFin || new Date(c.cotif) <= new Date(fechaFin));
      return pasaEstado && pasaFecha;
    })
    .sort((a, b) => new Date(b.cotif) - new Date(a.cotif));

    // Aplicamos el filtro de año y mes
    const cotizacionesFiltradasPorFecha = cotizaciones.filter(c => {
    const fecha = new Date(c.fecha || c.cotif);
    const pasaAnno = !currentFilters.anno || fecha.getFullYear() === Number(currentFilters.anno);
    const pasaMes = currentFilters.mes === "%" || (fecha.getMonth() + 1 === Number(currentFilters.mes));
    return pasaAnno && pasaMes;
    });

    const totalFiltrado = cotizacionesFiltradasPorFecha.length;

    // Agrupamos por cliente solo con las cotizaciones filtradas
    const clientesAgregados = Object.values(
    cotizacionesFiltradasPorFecha.reduce((acc, c) => {
        const key = c.cliente_codigo || "-";
        if (!acc[key]) {
        acc[key] = {
            cliente_codigo: key,
            cantidad: 0,
            totalSoles: 0,
            totalDolares: 0,
            porcentaje: 0, // inicializamos
        };
        }

        acc[key].cantidad += 1;

        if (c.tmone === "S" || !c.tmone) acc[key].totalSoles += Number(c.tot_c || 0);
        if (c.tmone === "D") acc[key].totalDolares += Number(c.tot_c || 0);

        return acc;
    }, {})
    ).map(c => ({
    ...c,
    porcentaje: totalFiltrado ? ((c.cantidad / totalFiltrado) * 100).toFixed(2) : 0
    }));

    const cotizacionesPorArea = Object.values(
    cotizacionesFiltradasPorFecha.reduce((acc, c) => {
        const key = c.area_nombre || "-";
        if (!acc[key]) acc[key] = { area: key, cantidad: 0 };
        acc[key].cantidad += 1;
        return acc;
    }, {})
    );

    const COLORS = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042",
    "#8dd1e1", "#a4de6c", "#d0ed57", "#ffc0cb",
    ];

    const TIPOS_COLORS = {
    P: "#8884d8", // Proyectos
    V: "#82ca9d", // Ventas
    S: "#ffc658", // Servicios
    };

    const tiposData = ["P", "V", "S"].map((t) => {
    const count = cotizacionesFiltradasPorFecha.filter(c => c.cotit === t).length;
    return {
        tipo: t,
        cantidad: count,
    };
    });

  if (loading) return <div className="p-6 space-y-6">Cargando cotizaciones...</div>;

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
    };

    const API_URL = import.meta.env.VITE_API_URL;
    const query = new URLSearchParams(params).toString();

    windowsOpen(
      `${API_URL}/cotizaciones/reportes/reporte_cotizaciones_dashboard_html/?${query}`,
      980,
      600
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col bg-gray-50 font-sans"
    >
      <div className="flex-1 flex flex-col py-[clamp(8px,2vw,24px)] px-[clamp(8px,2vw,24px)]">

        {/* HEADER ESTILO ERP COMPACTO */}
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
                  Dashboard
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
              { id: "rendimiento", label: "Rendimiento", icon: <ListTodo size={16} /> },
              { id: "analisis", label: "Análisis", icon: <Layout size={16} /> },
              { id: "automatizacion", label: "Automatización", icon: <History size={16} /> },
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
        <div className="p-6 flex flex-col flex-1 gap-6">
          {tabActiva === "resumen" && (
            <>
              <SemaforoCumplimiento anno={2026}/>
              <KpisResumen />
              <AlertasPanel />
              <TendenciasCharts />
            </>
          )}

          {tabActiva === "analisis" && (
            <>
              <AnalisisComercial />
              <GraficoDinamico
                data={data}
                dimension="area"
                metrica="monto_total"
                tipoDato="comparacion"
                titulo="Ventas por área"
              />              
            </>
          )}

          {tabActiva === "historial" &&<TablaHistorial />}
        </div>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6 w-full">
          {[
            {
              label: "Total Cotizaciones",
              value: stats.total || cotizaciones.length,
              bg: "bg-blue-100",
              text: "text-blue-800",
              border: "border-blue-300",
            },
            {
              label: "Monto Total S/.",
              value: stats.montoTotalSoles || 0,
              bg: "bg-green-100",
              text: "text-green-800",
              border: "border-green-300",
            },
            {
              label: "Monto Total $",
              value: stats.montoTotalDolares || 0,
              bg: "bg-violet-100",
              text: "text-violet-800",
              border: "border-violet-300",
            },
            {
              label: "Promedio S/.",
              value: stats.promedioSoles || 0,
              bg: "bg-red-100",
              text: "text-red-800",
              border: "border-red-300",
            },
            {
              label: "Promedio $",
              value: stats.promedioDolares || 0,
              bg: "bg-yellow-100",
              text: "text-yellow-800",
              border: "border-yellow-300",
            },
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`
                flex flex-col items-center justify-center p-2
                rounded-2xl shadow-sm border
                ${kpi.bg} ${kpi.border}
              `}
            >
              <p className={`text-base font-medium tracking-wide ${kpi.text}`}>
                {kpi.label}
              </p>

              <p className={`text-2xl font-extrabold mt-1 ${kpi.text}`}>
                {kpi.value.toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>

        {/* PIZARRA DINÁMICA */}
        <DashboardBoard module="cotizaciones" />


        {/* GRAFICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Fila 1, Columna 1 */}
        <div className="bg-white rounded-2xl shadow p-4">
        <p className="font-semibold mb-2">Cotizaciones por áreas</p>
        <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cotizacionesPorArea} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>

        {/* Fila 1, Columna 2 */}
        <div className="bg-white rounded-2xl shadow p-4">
        <p className="font-semibold mb-2">Distribución por Clientes</p>
        <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={clientesAgregados}
                dataKey="cantidad"
                nameKey="cliente_codigo"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label={(entry) => entry.cliente_codigo}
                >
                {clientesAgregados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} cotizaciones`, "Cantidad"]} />
            </PieChart>
            </ResponsiveContainer>
        </div>
        </div>

        {/* Fila 2, Columna 1 */}
        <div className="bg-white rounded-2xl shadow p-4">
        <p className="font-semibold mb-2">Distribución por Tipo</p>
        <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={tiposData}
                dataKey="cantidad"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                label={(entry) => entry.tipo}
                >
                {tiposData.map((entry) => (
                    <Cell key={entry.tipo} fill={TIPOS_COLORS[entry.tipo]} />
                ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} cotizaciones`, "Cantidad"]} />
            </PieChart>
            </ResponsiveContainer>
        </div>
        </div>

        {/* Fila 2, Columna 2 */}
        <div className="bg-white rounded-2xl shadow p-4">
            <p className="font-semibold mb-2">Comparativo mensual de cotizaciones.</p>
            <div className="h-52 flex items-center justify-center text-gray-400">
            Gráfico aquí
            </div>
        </div>
        </div>

        {/* TABLA CLIENTES */}
        <Table
        headers={["Cliente", "Cantidad de Cotizaciones", "Importe S/.", "Importe $", "Porcentaje"]}
        data={clientesAgregados}
        renderRow={(c) => [
            <span className="text-left font-medium">
              {clientesMap[c.cliente_codigo] ?? "Empresa no registrada"}
            </span>,
            <span className="text-center">{c.cantidad}</span>,
            <span className="text-right">
            {(c.totalSoles || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>,
            <span className="text-right">
            {(c.totalDolares || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>,
            <span className="text-right">{c.porcentaje}%</span>,
        ]}
        />

        {/* CARDS MOBILE */}
        <div className="flex flex-col gap-3 md:hidden">
          {cotizacionesFiltradas.map(c => (
            <motion.div
              key={c.numero}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
              onClick={() => { setCotizacionSeleccionada(c); setDetalleOpen(true); }}
            >
              <div className="font-semibold text-[clamp(0.9rem,2vw,1.1rem)]">{c.numero}</div>
              <div className="mt-2 flex flex-col gap-1 text-gray-600 text-[clamp(0.65rem,1.5vw,0.85rem)]">
                <div className="flex justify-between"><span>Fecha:</span><span>{c.fecha}</span></div>
                <div className="flex justify-between"><span>Referencia:</span><span>{c.referencia}</span></div>
                <div className="flex justify-between"><span>Cliente:</span><span>{c.cliente_nombre}</span></div>
                <div className="flex justify-between"><span>Área:</span><span>{c.area_nombre}</span></div>
                <div className="flex justify-between"><span>Estado:</span><span>{c.estado_nombre}</span></div>
                <div className="flex justify-between"><span>Importe:</span><span>{c.tot_c}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
