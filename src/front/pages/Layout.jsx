import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Layout = () => {
    const location = useLocation();

    const hideNavbarRoutes = ["/dashboard", "/explore"];

    return (
        <ScrollToTop>
            {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
            <Outlet />
            {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
        </ScrollToTop>
    );
};