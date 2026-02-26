import React from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResumenFilters() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Filter size={16} /> Filtros Inteligentes
        </h2>

        <Button size="sm" variant="outline" className="text-xs">
          Guardar Vista
        </Button>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

        <input className="input" placeholder="Fecha inicio" />
        <input className="input" placeholder="Fecha fin" />
        <input className="input" placeholder="Área" />
        <input className="input" placeholder="Cliente" />
        <input className="input" placeholder="Tipo" />
        <input className="input" placeholder="Estado" />
      </div>
    </div>
  );
}