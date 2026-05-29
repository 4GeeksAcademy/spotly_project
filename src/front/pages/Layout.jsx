import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Layout = () => {
    const location = useLocation();
    const { store } = useGlobalReducer();

    const hideNavbarRoutes = ["/dashboard", "/explore"];

    useEffect(() => {
        if (store.theme === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [store.theme]);

    return (
        <ScrollToTop>
            {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}

            <Outlet />

            {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
        </ScrollToTop>
    );
};