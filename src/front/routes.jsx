// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { SpotPage } from "./pages/SpotPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Explore } from "./pages/Explore.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
        <Dashboard />
        </ProtectedRoute>}/>
      <Route path="/crear-spot" element={<SpotPage />} />
      <Route path="/explore" element={
        <ProtectedRoute>
        <Explore />
        </ProtectedRoute> }/>
      <Route path="login" element={<Login mode="login" />} />
      <Route path="register" element={<Register mode="register" />} />
      <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
      <Route path="/demo" element={<Demo />} />
    </Route>
  )
);