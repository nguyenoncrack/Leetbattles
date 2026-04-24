import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  tone: "success" | "error" | "info";
  title: string;
  body?: string;
}

interface ToastCtx {
  toast: (t: Omit<Toast, "id">) => void;
}

const Ctx = createContext<ToastCtx | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const toast = useCallback<ToastCtx["toast"]>((t) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-80 rounded-xl border px-4 py-3 backdrop-blur shadow-glow ${
              t.tone === "success"
                ? "border-accent-green/40 bg-accent-green/10"
                : t.tone === "error"
                ? "border-accent-rose/40 bg-accent-rose/10"
                : "border-brand/40 bg-brand/10"
            }`}
          >
            <div className="text-sm font-semibold text-white">{t.title}</div>
            {t.body && (
              <div className="mt-0.5 text-xs text-slate-300">{t.body}</div>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
