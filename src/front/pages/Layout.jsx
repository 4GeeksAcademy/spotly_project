import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Layout = () => {
  const location = useLocation();

  const hideNavbar = ["/dashboard", "/explore", "/profile", "/notifications"];
  const showNavbar = !hideNavbar.some((r) => location.pathname.startsWith(r));

  return (
    <ScrollToTop>
      {showNavbar && <Navbar />}
      <Outlet />
      {showNavbar && <Footer />}
    </ScrollToTop>
  );
};