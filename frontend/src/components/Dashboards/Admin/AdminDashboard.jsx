import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [agent, setAgent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ======================================================
  // LOAD DATA
  // ======================================================

  const loadData = async () => {
    try {
      const [usersRes, agentRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/users`),
        axios.get(`${BASE_URL}/api/admin/agent`),
      ]);

      setUsers(usersRes.data);
      setAgent(agentRes.data);
    } catch (error) {
      console.error(
        "❌ Admin data error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ======================================================
  // CREATE AGENT
  // ======================================================

  const createAgent = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        `${BASE_URL}/api/admin/agent`,
        form
      );

      alert("Agent created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
      });

      loadData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create agent"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DISABLE / ENABLE AGENT
  // ======================================================

  const toggleAgent = async () => {
    try {
      const action = agent.isActive
        ? "disable"
        : "enable";

      await axios.patch(
        `${BASE_URL}/api/admin/agent/${agent._id}/${action}`
      );

      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  // ======================================================
  // DISABLE / ENABLE USER
  // ======================================================

  const toggleUser = async (user) => {
    try {
      const action = user.isActive
        ? "disable"
        : "enable";

      await axios.patch(
        `${BASE_URL}/api/admin/users/${user._id}/${action}`
      );

      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-500">
          Manage your ResolveNow system
        </p>

        {/* ========================================= */}
        {/* AGENT */}
        {/* ========================================= */}

        <div className="bg-white p-6 rounded-xl shadow border">

          <h2 className="text-xl font-semibold mb-4">
            Agent Management
          </h2>

          {agent ? (
            <div className="flex flex-col md:flex-row justify-between gap-4">

              <div>
                <p className="font-semibold">
                  {agent.name}
                </p>

                <p className="text-gray-500">
                  {agent.email}
                </p>

                <p className="mt-2">
                  Status:{" "}
                  <span
                    className={
                      agent.isActive
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {agent.isActive
                      ? "Active"
                      : "Disabled"}
                  </span>
                </p>
              </div>

              <button
                onClick={toggleAgent}
                className={`px-4 py-2 rounded-lg text-white ${
                  agent.isActive
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                {agent.isActive
                  ? "Disable Agent"
                  : "Enable Agent"}
              </button>

            </div>
          ) : (
            <form
              onSubmit={createAgent}
              className="grid md:grid-cols-3 gap-4"
            >

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Agent Name"
                className="border p-2 rounded"
                required
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Agent Email"
                className="border p-2 rounded"
                required
              />

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Agent Password"
                className="border p-2 rounded"
                required
              />

              <button
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-3"
              >
                {loading
                  ? "Creating..."
                  : "Create Agent"}
              </button>

            </form>
          )}

        </div>

        {/* ========================================= */}
        {/* USERS */}
        {/* ========================================= */}

        <div className="bg-white p-6 rounded-xl shadow border">

          <h2 className="text-xl font-semibold mb-4">
            Manage Users
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (

                  <tr
                    key={user._id}
                    className="border-b"
                  >

                    <td className="p-3">
                      {user.name}
                    </td>

                    <td className="p-3">
                      {user.email}
                    </td>

                    <td className="p-3">

                      <span
                        className={
                          user.isActive
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {user.isActive
                          ? "Active"
                          : "Disabled"}
                      </span>

                    </td>

                    <td className="p-3">

                      <button
                        onClick={() =>
                          toggleUser(user)
                        }
                        className={`px-3 py-1 rounded text-white ${
                          user.isActive
                            ? "bg-red-600"
                            : "bg-green-600"
                        }`}
                      >
                        {user.isActive
                          ? "Disable"
                          : "Enable"}
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;