import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProtectedRoute = ({ children }) => {
  const { store } = useGlobalReducer();

  const token = localStorage.getItem("token");

  if (!token && !store.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};