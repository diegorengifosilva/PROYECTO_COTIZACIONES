import React from "react";
import { DollarSign, BarChart3, CheckCircle } from "lucide-react";

const KPI = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
    <div className="p-2 bg-cyan-100 text-cyan-700 rounded-md">{icon}</div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

export default function KpisResumen() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KPI icon={<BarChart3 size={18} />} label="Cotizaciones" value="120" />
      <KPI icon={<CheckCircle size={18} />} label="Aprobadas" value="80" />
      <KPI icon={<DollarSign size={18} />} label="Ticket Promedio" value="S/. 9,800" />
      <KPI icon={<BarChart3 size={18} />} label="Ratio Aprobación" value="67%" />
    </div>
  );
}