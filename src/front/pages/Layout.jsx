import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toast } from "../components/Toast";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Layout = () => {
  const location = useLocation();
  const { store } = useGlobalReducer();

  const hideNavbarRoutes = [
    "/dashboard",
    "/explore",
    "/profile",
    "/notifications",
  ];

  const darkModeRoutes = [
    "/dashboard",
    "/explore",
    "/profile",
    "/notifications",
    "/single",
  ];

  useEffect(() => {
    const shouldUseDarkMode =
      store.theme === "dark" &&
      darkModeRoutes.some((route) => location.pathname.startsWith(route));

    document.body.classList.toggle("dark-mode", shouldUseDarkMode);
  }, [store.theme, location.pathname]);

  return (
    <ScrollToTop>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <Outlet />
      {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
      <Toast />
    </ScrollToTop>
  );
};