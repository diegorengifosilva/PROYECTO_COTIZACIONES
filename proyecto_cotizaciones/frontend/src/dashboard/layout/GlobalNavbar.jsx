import React from 'react';
import { 
  LayoutGrid, 
  Search, 
  Plus, 
  Bell, 
  HelpCircle, 
  Settings, 
  PanelLeftOpen 
} from 'lucide-react';
import logo from "@/assets/logo.png"; // Importamos tu logo real

export default function GlobalNavbar({ sidebarOpen, setSidebarOpen, user }) {
  return (
    <header className="h-12 border-b border-slate-200 flex items-center justify-between px-3 bg-white z-[100] shrink-0">
      
      {/* SECCIÓN IZQUIERDA: Marca Dinámica */}
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <div className="flex items-center animate-in fade-in slide-in-from-left-2 duration-300">
            {/* Botón para abrir sidebar */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-all mr-2"
              title="Mostrar barra lateral"
            >
              <PanelLeftOpen size={20} />
            </button>

            {/* Tu Logo Real y Nombre (Solo cuando el sidebar está oculto) */}
            <div className="flex items-center gap-2 px-2 h-7 border-l border-slate-200">
              <img 
                src={logo} 
                alt="V&C Logo" 
                className="h-9 w-14 object-contain" 
              />
            </div>
          </div>
        )}

        {/* App Switcher (Puntitos) - Estilo sutil */}
        {sidebarOpen && (
          <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-[#0052CC] transition-colors">
            <LayoutGrid size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* SECCIÓN CENTRAL: Buscador Minimalista */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8 gap-4">
        <div className="relative w-full max-w-[500px] group">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0052CC] transition-colors" 
            size={15} 
          />
          <input 
            type="text" 
            placeholder="Buscar en el sistema..."
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/10 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Botón Crear con Identidad V&C */}
        <button className="hidden sm:flex px-4 py-1.5 bg-[#0052CC] text-white rounded-md font-semibold text-sm hover:bg-[#0747A6] shadow-sm hover:shadow-md items-center gap-2 transition-all shrink-0 active:scale-95">
          <Plus size={16} strokeWidth={3} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* SECCIÓN DERECHA: Herramientas y Usuario */}
      <div className="flex items-center gap-1">
        <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-2 mr-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0052CC] rounded-full transition-colors" title="Notificaciones">
            <Bell size={18} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Ayuda">
            <HelpCircle size={18} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Configuración">
            <Settings size={18} />
          </button>
        </div>
        
        {/* Avatar Personalizado con iniciales inteligentes */}
        <div 
        className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center text-[12px] font-bold text-white cursor-pointer ring-2 ring-white shadow-sm hover:ring-[#0052CC]/30 transition-all"
        title={user?.nomb_cort_usu}
        >
        {user?.usuario_usu 
            ? user.usuario_usu
                .split(/[.\s]/) // Divide por puntos (diego.rengifo) o espacios (Diego Rengifo)
                .map(word => word[0]) // Toma la primera letra de cada palabra
                .join('') // Las une
                .substring(0, 2) // Se asegura de que no sean más de 2 letras
                .toUpperCase() 
            : "VC" // Default si no hay usuario
        }
        </div>
      </div>
    </header>
  );
}