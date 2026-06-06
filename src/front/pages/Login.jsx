import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Login = ({ mode = "login", setAuthMode }) => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    const endpoint = mode === "login" ? "/api/login" : "/api/register";

    const body =
      mode === "login"
        ? {
            email: formData.email,
            password: formData.password
          }
        : formData;

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.msg);
      return;
    }

    if (mode === "login") {
      dispatch({
        type: "login",
        payload: data
      });

      navigate("/dashboard");
    } else {
      toast.success("Welcome to Spotly!");
      navigate("/login");
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow p-4 border-0 rounded-4" style={{ width: "380px" }}>
        <h2 className="text-center mb-4 text-danger">
          {mode === "login" ? "LOG IN" : "Registro"}
        </h2>

        {mode === "login" && (
          <>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            <div className="mb-3">
              <label>Name</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label>Last name</label>
              <input
                type="text"
                name="apellido"
                className="form-control"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <button className="btn btn-danger w-100" onClick={handleSubmit}>
          {mode === "login" ? "Log in" : "Crear cuenta"}
        </button>

        <button
          className="btn btn-link w-100 mt-2"
          onClick={() => {
            if (setAuthMode) setAuthMode(null);
            else navigate("/");
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};