import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Register = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    pais: "",
    genero: "",
  });

  const showToast = (message, type = "success") => {
    dispatch({
      type: "show_toast",
      payload: { message, type },
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.msg || "Error creating account", "error");
        return;
      }

      showToast("Account created successfully!", "success");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);
      showToast("Network error. Please try again.", "error");
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center py-5">
      <div className="card shadow p-4 border-0 rounded-4" style={{ width: "430px" }}>
        <h2 className="text-center mb-2 text-danger">Sign up</h2>

        <p className="text-center text-muted mb-4">
          Join Spotly and find incredible spots!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-6 mb-3">
              <label>Name</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-6 mb-3">
              <label>Last name</label>
              <input
                type="text"
                name="apellido"
                className="form-control"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
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
              required
            />
          </div>

          <div className="mb-3">
            <label>Phone Number</label>
            <input
              type="text"
              name="telefono"
              className="form-control"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Country</label>
            <input
              type="text"
              name="pais"
              className="form-control"
              value={formData.pais}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label>Gender</label>
            <select
              name="genero"
              className="form-control"
              value={formData.genero}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="masculino">Male</option>
              <option value="femenino">Female</option>
              <option value="otro">Other</option>
            </select>
          </div>

          <button className="btn btn-danger w-100">
            Create account
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted">Do you already have an account? </span>
          <Link to="/login" className="text-danger">
            LOG IN
          </Link>
        </div>
      </div>
    </div>
  );
};