// src/dashboard/cotizaciones/CondicionesModal.jsx
import { useState, useEffect, useMemo, useRef } from "react"; // Añadimos useRef
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ShieldCheck, Info, FileText } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import NotasModal from "./NotasModal";

export default function CondicionesModal({
  open,
  onClose,
  condicionesIniciales,
  onAceptar,
}) {
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  
  // 1. ESTADO PARA EL SUBMODAL
  const [notasOpen, setNotasOpen] = useState(false);
  
  // Referencia para acceder a la instancia de Quill
  const quillRef = useRef(null);

  useEffect(() => {
    if (open) setTexto(condicionesIniciales ?? "");
  }, [open, condicionesIniciales]);

  const handleGuardar = async () => {
    try {
      setSaving(true);
      if (onAceptar) await onAceptar(texto);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // 2. FUNCIÓN PARA INSERTAR LAS NOTAS SELECCIONADAS
  const handleInsertarNotas = (textos) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection() || { index: quill.getLength() };

    textos.forEach((t) => {
      // 1. Insertamos un salto de línea inicial
      quill.insertText(range.index, "\n");
      
      // 2. Insertamos el texto con el color Teal específico
      const notaTexto = ` NOTA TÉCNICA: ${t} `;
      quill.insertText(range.index + 1, notaTexto, {
        bold: true,
        color: "#0d9488", 
      });

      // 3. Convertimos esa línea en un blockquote (usará el estilo del CSS de arriba)
      quill.formatLine(range.index + 1, notaTexto.length, 'blockquote', true);
      
      // Actualizamos el índice para la siguiente nota
      range.index += notaTexto.length + 1;
    });

    // 4. IMPORTANTE: Insertamos una línea vacía al final y quitamos los formatos
    // para que el usuario pueda seguir escribiendo en negro/normal abajo.
    quill.insertText(range.index + 1, "\n");
    quill.formatLine(range.index + 1, 1, 'blockquote', false);
    quill.removeFormat(range.index + 1, 1);
    
    quill.setSelection(range.index + 2);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["notes"], 
        ["clean"],
      ],
      handlers: {
        // 3. ACTUALIZAMOS EL HANDLER PARA ABRIR EL SUBMODAL
        notes: function() {
          setNotasOpen(true);
        },
      },
    },
  }), []);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      const notesButton = document.querySelector(".ql-notes");
      if (notesButton && !notesButton.innerHTML) {
        const iconString = renderToStaticMarkup(
          <FileText size={16} strokeWidth={2.5} style={{ margin: 'auto' }} />
        );
        notesButton.innerHTML = iconString;
      }

      // ... (Tus tooltips se mantienen igual)
      const labels = {
        'ql-bold': 'Negrita',
        'ql-italic': 'Cursiva',
        'ql-underline': 'Subrayado',
        'ql-strike': 'Tachado',
        'ql-blockquote': 'Cita',
        'ql-list': { value: 'ordered', label: 'Lista numerada' },
        'ql-bullet': { value: 'bullet', label: 'Viñetas' },
        'ql-link': 'Insertar enlace',
        'ql-notes': 'Agregar Notas Técnicas', 
        'ql-clean': 'Borrar formato',
      };

      Object.keys(labels).forEach((className) => {
        const elements = document.getElementsByClassName(className);
        Array.from(elements).forEach((el) => {
          const item = labels[className];
          if (typeof item === 'string') el.setAttribute('title', item);
        });
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border-none p-0 overflow-hidden font-sans">
        
        {/* HEADER */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Condiciones Generales</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Propuesta Económica</p>
            </div>
          </div>
        </div>

        {/* EDITOR CON REF */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col bg-slate-50/50">
          <style>{`
            .quill-sticky-container { display: flex; flex-direction: column; height: 100%; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            .ql-toolbar.ql-snow { position: sticky; top: 0; z-index: 10; background: #f8fafc !important; border: none !important; border-bottom: 1px solid #e2e8f0 !important; padding: 8px !important; }
            .ql-notes { width: 34px !important; display: flex !important; align-items: center; justify-content: center; border-radius: 6px; margin-right: 4px; transition: all 0.2s; color: #475569; }
            .ql-notes:hover { background: #e0f2fe !important; color: #0369a1 !important; }
            .ql-container.ql-snow { border: none !important; flex: 1; overflow-y: auto !important; font-size: 13px; }
            .ql-editor blockquote {
                border-left: 4px solid #14b8a6 !important; /* Borde Teal */
                background-color: #f0fdfa !important;    /* Fondo Teal muy suave */
                color: #0d9488 !important;               /* Texto en Teal */
                padding: 12px 15px !important;
                margin: 10px 0 !important;
                border-radius: 0 8px 8px 0;
                font-style: normal !important;           /* Quitamos la cursiva por defecto */
              }
          `}</style>

          <div className="quill-sticky-container shadow-inner">
            <ReactQuill
              ref={quillRef} // <--- Asignamos la referencia
              value={texto}
              onChange={setTexto}
              theme="snow"
              modules={modules}
              className="flex-1 flex flex-col overflow-hidden"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 opacity-70">
            <Info size={14} className="text-slate-400" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Afecta la impresión del PDF</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="text-[11px] font-black uppercase text-red-700 h-9 px-8 rounded-xl">Salir</Button>
            <Button variant="ghost"onClick={handleGuardar} disabled={saving} className="text-[11px] font-black uppercase text-sky-700 h-9 px-8 rounded-xl border border-transparent hover:border-sky-200 hover:bg-sky-50">
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* 4. COMPONENTE NOTASMODAL INYECTADO */}
        <NotasModal 
          open={notasOpen} 
          onClose={() => setNotasOpen(false)} 
          onAceptar={handleInsertarNotas} 
        />

      </DialogContent>
    </Dialog>
  );
}