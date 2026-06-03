export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    theme: localStorage.getItem("theme") || "light",
    toast: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "login":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
      };

    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        ...store,
        token: null,
        user: null,
      };

    case "set_user":
      localStorage.setItem("user", JSON.stringify(action.payload));

      return {
        ...store,
        user: action.payload,
      };

    case "toggle_theme": {
      const newTheme = store.theme === "dark" ? "light" : "dark";

      localStorage.setItem("theme", newTheme);

      return {
        ...store,
        theme: newTheme,
      };
    }

    case "show_toast":
      return {
        ...store,
        toast: {
          message: action.payload.message,
          type: action.payload.type || "success",
        },
      };

    case "hide_toast":
      return {
        ...store,
        toast: null,
      };

    default:
      throw Error("Unknown action.");
  }
}