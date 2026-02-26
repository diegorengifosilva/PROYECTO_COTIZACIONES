import React from "react";
import { LineChart } from "lucide-react";

export default function TendenciasCharts() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">

      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <LineChart size={16} /> Tendencias y Proyección
      </h2>

      <div className="h-60 flex items-center justify-center text-slate-400">
        Gráficos de tendencias aquí
      </div>
    </div>
  );
}