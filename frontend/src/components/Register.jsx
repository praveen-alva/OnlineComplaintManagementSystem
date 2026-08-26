import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (form.password !== form.confirmPassword) {
    return setError("Passwords do not match");
  }

  try {
    setLoading(true);

    const registerData = {
      name: form.name,
      email: form.email,
      password: form.password,
      type: form.type,
    };

    console.log("Sending registration data:", registerData);

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/register`,
      registerData,
      {
        withCredentials: true,
      }
    );

    console.log("Registration response:", res.data);

    const registeredUser = res.data.user;

    if (registeredUser.type === "user") {
      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      localStorage.removeItem("agent");

      navigate("/UserDashboard");
    } else if (registeredUser.type === "agent") {
      localStorage.setItem(
        "agent",
        JSON.stringify(registeredUser)
      );

      localStorage.removeItem("user");

      navigate("/AgentDashboard");
    }

  } catch (err) {
    console.error("Registration error:", err);
    console.log("Backend response:", err.response?.data);

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
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:underline">
              Already have an account? Sign in
            </Link>
          </p>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', name: 'name', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Password', name: 'password', type: 'password' },
            { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block mb-1 font-medium">{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">Account Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select Account Type</option>
              <option value="user">User</option>
              <option value="agent">Agent</option>
              {/* <option value="Admin">Admin</option> */}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
