export const Login = ({ mode }) => {
    return (
        <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">

            <div className="card shadow p-4 border-0 rounded-4" style={{ width: "380px" }}>

                <h2 className="text-center mb-4 text-danger">
                    {mode === "login" ? "Iniciar Sesión" : "Registro"}
                </h2>

                {/* LOGIN */}
                {mode === "login" && (
                    <>
                        <div className="mb-3">
                            <label>Usuario</label>
                            <input type="text" className="form-control" />
                        </div>

                        <div className="mb-3">
                            <label>Contraseña</label>
                            <input type="password" className="form-control" />
                        </div>
                    </>
                )}

                {/* REGISTER */}
                {mode === "register" && (
                    <>
                        <div className="mb-3">
                            <label>Nombre</label>
                            <input type="text" className="form-control" />
                        </div>

                        <div className="mb-3">
                            <label>Apellido</label>
                            <input type="text" className="form-control" />
                        </div>

                        <div className="mb-3">
                            <label>Email</label>
                            <input type="email" className="form-control" />
                        </div>

                        <div className="mb-3">
                            <label>Contraseña</label>
                            <input type="password" className="form-control" />
                        </div>
                    </>
                )}

                <button className="btn btn-danger w-100">
                    {mode === "login" ? "Entrar" : "Crear cuenta"}
                </button>

                {/* cerrar modal */}
                <button
                    className="btn btn-link w-100 mt-2"
                    onClick={() => setAuthMode(null)}
                >
                    Cerrar
                </button>

            </div>
        </div>
    );
};