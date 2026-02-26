import React, { useMemo, useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { obtenerResumenDashboard } from "../../../services/dashboardService";

/* =========================
   CARD INDIVIDUAL
========================= */
const Card = ({ title, logrado, min, max }) => {
  const porcentaje = useMemo(() => {
    if (!max) return 0;
    return ((logrado / max) * 100).toFixed(1);
  }, [logrado, max]);

  const status = useMemo(() => {
    if (logrado >= max) return "ok";
    if (logrado >= min) return "warning";
    return "danger";
  }, [logrado, min, max]);

  const colors = {
    ok: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  const label = {
    ok: "Cumpliendo",
    warning: "En riesgo",
    danger: "Crítico",
  };

  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
      <span className="text-xs text-slate-500">{title}</span>
      <span className="text-2xl font-bold">{porcentaje}%</span>
      <span className={`text-xs px-2 py-0.5 rounded w-fit ${colors[status]}`}>
        {label[status]}
      </span>
    </div>
  );
};

/* =========================
   COMPONENTE PRINCIPAL
========================= */
export default function SemaforoCumplimiento({ anno = new Date().getFullYear() }) {
  const [objetivo, setObjetivo] = useState(null);
  const [logrado, setLogrado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resObjetivo, resLogrado] = await Promise.all([
          api.get(`/dashboard/objetivos/?anno=${anno}`),
          api.get(`/dashboard/logrado/?anno=${anno}`)
        ]);

        setObjetivo(resObjetivo.data);
        setLogrado(resLogrado.data);
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };

    if (anno) cargar();
  }, [anno]);

  const resumen = useMemo(() => {
    if (!objetivo?.areas || !logrado) return null;

    let minAnual = 0;
    let maxAnual = 0;

    objetivo.areas.forEach(a => {
      minAnual += Number(a.minimo || 0);
      maxAnual += Number(a.maximo || 0);
    });

    const minMensual = minAnual / 12;
    const maxMensual = maxAnual / 12;

    const logradoAnual = Number(logrado.anual || 0);
    const logradoMensual = Number(logrado.mensual || 0);

    return {
      anual: {
        min: minAnual,
        max: maxAnual,
        logrado: logradoAnual
      },
      mensual: {
        min: minMensual,
        max: maxMensual,
        logrado: logradoMensual
      }
    };
  }, [objetivo, logrado]);

  const getEstado = (logrado, min, max) => {
    if (logrado >= max) return "verde";
    if (logrado >= min) return "amarillo";
    return "rojo";
  };

  const getColor = (estado) => {
    switch (estado) {
      case "verde":
        return "bg-green-100 text-green-700";
      case "amarillo":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  if (loading)
    return (
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        Cargando cumplimiento...
      </div>
    );

  if (!resumen)
    return (
      <div className="bg-white border rounded-2xl p-4 shadow-sm">
        Sin datos para {anno}
      </div>
    );

  const renderCard = (titulo, data) => {
    const estado = getEstado(data.logrado, data.min, data.max);
    const porcentaje = ((data.logrado / data.max) * 100).toFixed(1);
    const faltante = data.max - data.logrado;

    return (
      <div className="p-4 border rounded-xl flex flex-col gap-2">
        <p className="text-xs text-slate-500">{titulo}</p>
        <p className="text-2xl font-bold">{porcentaje}%</p>
        <span className={`text-xs px-2 py-1 rounded w-fit ${getColor(estado)}`}>
          {estado.toUpperCase()}
        </span>
        <p className="text-xs text-slate-400">
          Faltan ${faltante.toLocaleString()} para el máximo
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <TrendingUp size={16} /> Cumplimiento {anno}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCard("Cumplimiento Anual", resumen.anual)}
        {renderCard("Cumplimiento Mensual", resumen.mensual)}
      </div>
    </div>
  );
}