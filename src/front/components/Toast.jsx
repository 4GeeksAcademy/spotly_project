import { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Toast = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    if (!store.toast) return;

    const timer = setTimeout(() => {
      dispatch({ type: "hide_toast" });
    }, 2500);

    return () => clearTimeout(timer);
  }, [store.toast, dispatch]);

  if (!store.toast) return null;

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  return (
    <div className={`toast-message toast-${store.toast.type}`}>
      {icons[store.toast.type] || icons.success}
      <span>{store.toast.message}</span>
    </div>
  );
};