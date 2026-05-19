export const Login = () => {
  return (

    <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">

      <div className="card shadow p-4 border-0 rounded-4" style={{ width: "380px" }}>

        <h2 className="text-center mb-4 text-danger">
          Welcome Back
        </h2>

        {/* USER */}
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ingrese usuario"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Ingrese email"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            placeholder="Ingrese contraseña"
          />
        </div>

        <button className="btn btn-danger w-100">
          Log In
        </button>

      </div>

    </div>
  );
};