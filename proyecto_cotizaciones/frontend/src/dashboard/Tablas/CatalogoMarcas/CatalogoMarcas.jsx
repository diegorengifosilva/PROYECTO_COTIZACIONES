import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Cpu, Factory, Zap, HardDrive, CpuIcon, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CatalogoMarcas() {
  const [tabActiva, setTabActiva] = useState("rockwell");

  const TABS = [
    { id: "rockwell", label: "Rockwell", icon: <Cpu size={16} /> },
    { id: "hoffman", label: "Hoffman", icon: <Factory size={16} /> },
    { id: "rittal", label: "Rittal", icon: <HardDrive size={16} /> },
    { id: "abb", label: "ABB", icon: <Zap size={16} /> },
    { id: "phoenix", label: "Phoenix Contact", icon: <CpuIcon size={16} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen w-full flex flex-col bg-white font-sans">
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 pt-4 flex flex-col gap-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <nav className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              <span>Configuración</span><span>/</span><span>Productos</span>
            </nav>
            <div className="flex items-center gap-2">
              <div className="bg-purple-600/10 text-purple-700 w-7 h-7 rounded-md flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight">Catálogo de Marcas</h1>
            </div>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-8 rounded-md flex items-center gap-2">
            <Plus size={14} /> Agregar Producto
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-slate-500 text-xs pb-1">
          <Info size={14} className="text-purple-500" />
          <p>Gestión técnica de inventario y repuestos clasificados por fabricante.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setTabActiva(tab.id)} className={`group relative flex items-center gap-2 px-3 pb-3 text-sm font-medium outline-none ${tabActiva === tab.id ? "text-cyan-600" : "text-slate-600 hover:bg-slate-50"}`}>
              <span className={tabActiva === tab.id ? "text-cyan-600" : "text-slate-400"}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tabActiva === tab.id && <motion.div layoutId="activeTabMarca" className="absolute bottom-0 left-0 right-0 h-[3px] bg-cyan-600 rounded-t-full" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 bg-slate-50/30">
        <div className="h-full bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-400 font-mono text-xs uppercase tracking-widest">
           Cargando Base de Datos {TABS.find(t => t.id === tabActiva)?.label}...
        </div>
      </div>
    </motion.div>
  );
}