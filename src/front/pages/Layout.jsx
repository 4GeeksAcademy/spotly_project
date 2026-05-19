import { useState } from "react";
import { Outlet } from "react-router-dom/dist";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Login } from "../pages/Login";

export const Layout = () => {
  const [authMode, setAuthMode] = useState(null); 
  // null | "login" | "register"

  return (
    <ScrollToTop>
      <Navbar setAuthMode={setAuthMode} />

      {authMode && (
        <Login mode={authMode} setAuthMode={setAuthMode} />
      )}

      <Outlet />
      <Footer />
    </ScrollToTop>
  );
};