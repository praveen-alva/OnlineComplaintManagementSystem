import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/login`,
        form,
        {
          withCredentials: true,
        }
      );

      console.log("Login response:", res.data);
    

      const loggedUser = res.data.user;

      if (!loggedUser) {
        setError("Invalid login response");
        return;
      }

      // Clear previous login data
      localStorage.removeItem("user");
      localStorage.removeItem("agent");

      // USER LOGIN
      if (loggedUser.type === "user") {
        localStorage.setItem(
          "user",
          JSON.stringify(loggedUser)
        );

        navigate("/UserDashboard");
      }

      // AGENT LOGIN
      else if (loggedUser.type === "agent") {
        localStorage.setItem(
          "agent",
          JSON.stringify(loggedUser)
        );

        navigate("/AgentDashboard");
      }

      else {
        setError("Invalid account type");
      }

    } catch (err) {
      console.error("Login error:", err);

      console.log(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#eff6ff] px-4">

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4">

        {/* Heading */}
        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Sign in to your account
          </h1>

          <p className="text-sm text-gray-600">

            <Link
              to="/register"
              className="text-blue-600 hover:underline"
            >
              Or create a new account
            </Link>

          </p>

        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Email */}
          <div>

            <label className="block mb-1 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your email"
            />

          </div>

          {/* Password */}
          <div>

            <label className="block mb-1 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your password"
            />

          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Login;