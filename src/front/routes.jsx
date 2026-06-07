import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Explore } from "./pages/Explore.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { SpotModal } from "./pages/SpotModal";
import { Profile } from "./pages/Profile";
import { Notifications } from "./pages/Notifications";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login mode="login" />} />
        <Route path="register" element={<Register mode="register" />} />
        <Route path="demo" element={<Demo />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/crear-spot"
        element={
          <ProtectedRoute>
            <SpotModal />
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/single/:theId"
        element={
          <ProtectedRoute>
            <Single />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<h1>Not found!</h1>} />
    </>
  )
);