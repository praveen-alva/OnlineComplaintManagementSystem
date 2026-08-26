import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  FiFileText,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(BASE_URL);

const AgentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  // ===============================
  // FETCH COMPLAINTS
  // ===============================

  useEffect(() => {
    fetchComplaints();

    socket.on("complaintStatusUpdated", (updatedItem) => {
      setComplaints((prev) =>
        prev.map((item) =>
          item._id === updatedItem._id ? updatedItem : item
        )
      );
    });

    socket.on("newComplaint", (newComplaint) => {
      setComplaints((prev) => [newComplaint, ...prev]);
    });

    return () => {
      socket.off("complaintStatusUpdated");
      socket.off("newComplaint");
    };
  }, []);

  // ===============================
  // GET ALL COMPLAINTS
  // ===============================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/complaints`
      );

      setComplaints(res.data.complaints || res.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch complaints:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UPDATE STATUS
  // ===============================

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      const res = await axios.patch(
        `${BASE_URL}/api/complaints/${id}`,
        {
          status: newStatus,
        }
      );

      const updatedComplaint =
        res.data.complaint || res.data;

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === id
            ? updatedComplaint
            : item
        )
      );
    } catch (error) {
      console.error(
        "Failed to update status:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update complaint status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ===============================
  // STATISTICS
  // ===============================

  const total = complaints.length;

  const pending = complaints.filter(
    (c) =>
      c.status?.toLowerCase() === "pending"
  ).length;

  const inProgress = complaints.filter(
    (c) =>
      c.status?.toLowerCase() === "in progress"
  ).length;

  const resolved = complaints.filter(
    (c) =>
      c.status?.toLowerCase() === "resolved"
  ).length;

  // ===============================
  // STATUS CHART DATA
  // ===============================

  const statusData = [
    {
      name: "Pending",
      count: pending,
    },
    {
      name: "In Progress",
      count: inProgress,
    },
    {
      name: "Resolved",
      count: resolved,
    },
  ];

  // ===============================
  // PIE CHART DATA
  // ===============================

  const pieData = [
    {
      name: "Pending",
      value: pending,
    },
    {
      name: "In Progress",
      value: inProgress,
    },
    {
      name: "Resolved",
      value: resolved,
    },
  ];

  // ===============================
  // CATEGORY DATA
  // ===============================

  const categoryCounts = {};

  complaints.forEach((complaint) => {
    const category =
      complaint.category || "Other";

    categoryCounts[category] =
      (categoryCounts[category] || 0) + 1;
  });

  const categoryData = Object.entries(
    categoryCounts
  ).map(([name, count]) => ({
    name,
    count,
  }));

  // ===============================
  // FILTER
  // ===============================

  const filteredComplaints =
    filter === "All"
      ? complaints
      : complaints.filter(
          (complaint) =>
            complaint.status?.toLowerCase() ===
            filter.toLowerCase()
        );

  // ===============================
  // UI
  // ===============================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER ================= */}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agent Portal
            </h1>

            <p className="text-sm text-gray-500">
              Manage and resolve user complaints
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              "All",
              "Pending",
              "In Progress",
              "Resolved",
            ].map((status) => (
              <button
                key={status}
                onClick={() =>
                  setFilter(status)
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                  filter === status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </header>

        {/* ================= STAT CARDS ================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            title="Total Complaints"
            count={total}
            icon={<FiFileText />}
          />

          <StatCard
            title="Pending"
            count={pending}
            icon={<FiClock />}
          />

          <StatCard
            title="In Progress"
            count={inProgress}
            icon={<FiAlertCircle />}
          />

          <StatCard
            title="Resolved"
            count={resolved}
            icon={<FiCheckCircle />}
          />

        </div>

        {/* ================= CHARTS ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* BAR CHART */}

          <div className="bg-white rounded-xl shadow-sm border p-6">

            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Complaint Status
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={statusData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="count"
                  name="Complaints"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* PIE CHART */}

          <div className="bg-white rounded-xl shadow-sm border p-6">

            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Complaint Distribution
            </h2>

            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#ef4444",
                            "#f59e0b",
                            "#22c55e",
                          ][index]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* ================= CATEGORY CHART ================= */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            Complaints by Category
          </h2>

          {categoryData.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No category data available
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={categoryData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="count"
                  name="Complaints"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* ================= TABLE ================= */}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No complaints found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm text-gray-600">

                <thead className="bg-gray-100 text-xs text-gray-500 uppercase">

                  <tr>
                    <th className="px-6 py-3">
                      ID
                    </th>

                    <th className="px-6 py-3">
                      Subject
                    </th>

                    <th className="px-6 py-3">
                      User
                    </th>

                    <th className="px-6 py-3">
                      Category
                    </th>

                    <th className="px-6 py-3">
                      Status Action
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredComplaints.map(
                    (item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-mono text-xs">
                          #
                          {String(item._id)
                            .slice(-6)
                            .toUpperCase()}
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.title ||
                            item.subject ||
                            "No Subject"}
                        </td>

                        <td className="px-6 py-4">
                          {item.userName ||
                            item.name ||
                            "User"}
                        </td>

                        <td className="px-6 py-4">
                          {item.category ||
                            "General"}
                        </td>

                        <td className="px-6 py-4">

                          <select
                            disabled={
                              updatingId ===
                              item._id
                            }
                            value={
                              item.status ||
                              "Pending"
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                item._id,
                                e.target.value
                              )
                            }
                            className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >

                            <option value="Pending">
                              Pending
                            </option>

                            <option value="In Progress">
                              In Progress
                            </option>

                            <option value="Resolved">
                              Resolved
                            </option>

                          </select>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// ===============================
// STAT CARD
// ===============================

const StatCard = ({
  title,
  count,
  icon,
}) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between">

    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        {title}
      </p>

      <p className="text-2xl font-bold text-gray-900 mt-1">
        {count}
      </p>
    </div>

    <div className="p-3 bg-gray-50 rounded-lg text-blue-600 text-xl">
      {icon}
    </div>

  </div>
);

export default AgentDashboard;