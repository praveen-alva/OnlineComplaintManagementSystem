import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,

        // IMPORTANT:
        // Every public registration is a USER.
        type: "user",
      };

      console.log("Registering user:", registerData);

      const res = await axios.post(
        `${BASE_URL}/api/register`,
        registerData,
        {
          withCredentials: true,
        }
      );

      console.log("Registration response:", res.data);

      const registeredUser = res.data.user;

      if (!registeredUser) {
        setError("Invalid registration response");
        return;
      }

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      // Make sure old agent session is removed
      localStorage.removeItem("agent");

      // Go to USER dashboard
      navigate("/UserDashboard");

    } catch (err) {
      console.error("Registration error:", err);

      console.log(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
        "Registration failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#e6edff] px-4">

      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow space-y-4">

        {/* Heading */}

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="text-sm text-gray-600">

            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Already have an account? Sign in
            </Link>

          </p>

        </div>

        {/* Error */}

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Name */}

          <div>

            <label className="block mb-1 font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your full name"
            />

          </div>

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
              placeholder="Enter password"
            />

          </div>

          {/* Confirm Password */}

          <div>

            <label className="block mb-1 font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="Confirm password"
            />

          </div>

          {/* Account type information */}

          <div className="bg-blue-50 border border-blue-200 rounded p-3">

            <p className="text-sm text-blue-700">
              Account Type: <strong>User</strong>
            </p>

          </div>

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Register;