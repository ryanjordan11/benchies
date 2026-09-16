import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const config = {
          success: {
            bg: "bg-[#141414] text-white border-[#141414]",
            icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          },
          error: {
            bg: "bg-rose-950 text-white border-rose-600",
            icon: <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />,
          },
          info: {
            bg: "bg-[#141414] text-[#E4E3E0] border-[#141414]",
            icon: <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />,
          },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-2.5 border shadow-md font-mono text-[11px] ${config.bg} transition-all duration-200`}
          >
            <div className="flex items-center space-x-2">
              {config.icon}
              <span className="uppercase tracking-tight">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="ml-3 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
