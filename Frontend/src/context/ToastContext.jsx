import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-500",
    progress: "bg-green-500",
    iconBg: "bg-green-100",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-500",
    progress: "bg-red-500",
    iconBg: "bg-red-100",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
    progress: "bg-amber-500",
    iconBg: "bg-amber-100",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
    progress: "bg-blue-500",
    iconBg: "bg-blue-100",
  },
};

function Toast({ toast, onDismiss }) {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`toast-item relative flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm overflow-hidden ${config.bg} ${config.border}`}
      role="alert"
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.iconBg}`}>
        <Icon className={`w-4.5 h-4.5 ${config.iconColor}`} />
      </div>
      <p className={`text-[13px] font-semibold flex-1 leading-snug pr-5 ${config.text}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer ${config.text} opacity-60 hover:opacity-100`}
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div
        className={`absolute bottom-0 left-0 h-[3px] rounded-full ${config.progress} animate-progress`}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => addToast("success", message, duration),
    [addToast],
  );

  const error = useCallback(
    (message, duration) => addToast("error", message, duration),
    [addToast],
  );

  const warning = useCallback(
    (message, duration) => addToast("warning", message, duration),
    [addToast],
  );

  const info = useCallback(
    (message, duration) => addToast("info", message, duration),
    [addToast],
  );

  const value = {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container — top-center on mobile, top-right on desktop */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-[9999] flex flex-col gap-2.5 w-[calc(100%-2rem)] md:w-full max-w-sm pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
