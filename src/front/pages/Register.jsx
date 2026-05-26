import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    pais: "",
    genero: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.msg);
      return;
    }

    alert("Cuenta creada correctamente");
    navigate("/login");
  };

  return (
    <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center py-5">
      <div className="card shadow p-4 border-0 rounded-4" style={{ width: "430px" }}>
        <h2 className="text-center mb-2 text-danger">
          Crear cuenta
        </h2>

        <p className="text-center text-muted mb-4">
          Únete a Spotly y empieza a descubrir lugares.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-6 mb-3">
              <label>Nombre</label>
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
              <label>Apellido</label>
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
            <label>Contraseña</label>
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
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              className="form-control"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>País</label>
            <input
              type="text"
              name="pais"
              className="form-control"
              value={formData.pais}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label>Género</label>
            <select
              name="genero"
              className="form-control"
              value={formData.genero}
              onChange={handleChange}
            >
              <option value="">Selecciona una opción</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <button className="btn btn-danger w-100">
            Crear cuenta
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted">¿Ya tienes cuenta? </span>
          <Link to="/login" className="text-danger">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};