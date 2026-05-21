import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { loginUser } from "../store";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await loginUser(
      formData.email,
      formData.password,
      dispatch
    );

    if (success) {
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-dark" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};