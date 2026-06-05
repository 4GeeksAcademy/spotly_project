import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "14px",
            background: "#111827",
            color: "#fff",
            fontWeight: "600",
          },
          success: {
            iconTheme: {
              primary: "#ef3340",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef3340",
              secondary: "#fff",
            },
          },
        }}
      />
    </ScrollToTop>
  );
};