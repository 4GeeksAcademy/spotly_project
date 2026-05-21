const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const initialStore = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return {
    message: null,

    token: token || null,
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token,

    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};

export const loginUser = async (email, password, dispatch) => {
  try {
    const response = await fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    dispatch({
      type: "login",
      payload: {
        token: data.token,
        user: data.user,
      },
    });

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await fetch(`${backendUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Register failed");
    }

    return true;
  } catch (error) {
    console.error("Register error:", error);
    return false;
  }
};

export const logoutUser = (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  dispatch({
    type: "logout",
  });
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    case "login":
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };

    case "logout":
      return {
        ...store,
        token: null,
        user: null,
        isAuthenticated: false,
      };

    default:
      throw Error("Unknown action.");
  }
}