import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { EllipsisVertical } from "lucide-react";

const ActionMenu = ({ 
  options = [], 
  title = "Acciones", 
  customTrigger = null, // Nueva prop para pasar el Badge del Total
  align = "end",
  children // Para contenido extra si no usas 'options'
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <button 
            className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all outline-none focus:ring-2 focus:ring-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical className="w-4 h-4" />
          </button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align={align} 
          sideOffset={8}
          className="z-[100] min-w-[220px] bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] border border-slate-100 animate-in fade-in zoom-in duration-200"
        >
          {title && (
            <div className="px-3 py-2 mb-1 border-b border-slate-50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {title}
              </span>
            </div>
          )}

          {/* Renderizamos los hijos si existen (para el desglose de montos) */}
          {children}

          {/* Renderizamos las opciones normales */}
          {options.map((option, index) => (
            <React.Fragment key={index}>
              {option.type === 'separator' ? (
                <DropdownMenu.Separator className="h-[1px] bg-slate-100 my-1" />
              ) : (
                <DropdownMenu.Item 
                  className={`flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-tight rounded-xl cursor-pointer outline-none transition-all 
                    ${option.variant === 'danger' 
                      ? 'text-red-500 hover:bg-red-50' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    option.onClick?.();
                  }}
                >
                  {option.icon && <option.icon className="w-4 h-4 opacity-70" />}
                  {option.label}
                </DropdownMenu.Item>
              )}
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ActionMenu;