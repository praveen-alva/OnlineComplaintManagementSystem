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
  FiBell,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiX,
} from "react-icons/fi";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(BASE_URL);

const AgentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const [updatingId, setUpdatingId] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);

  // =====================================================
  // FETCH COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/complaints`
      );

      setComplaints(
        response.data.complaints ||
          response.data ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to fetch complaints:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ADD NOTIFICATION
  // =====================================================

  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
    };

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);
  };

  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    fetchComplaints();

    // New complaint
    const handleNewComplaint = (newComplaint) => {
      setComplaints((prev) => [
        newComplaint,
        ...prev,
      ]);

      addNotification(
        `New complaint received: ${
          newComplaint.title || "New Complaint"
        }`
      );
    };

    // Complaint status updated
    const handleStatusUpdate = (updatedComplaint) => {
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === updatedComplaint._id
            ? updatedComplaint
            : complaint
        )
      );

      addNotification(
        `Complaint #${String(
          updatedComplaint._id
        )
          .slice(-6)
          .toUpperCase()} status changed to ${
          updatedComplaint.status
        }`
      );
    };

    // Complaint deleted
    const handleComplaintDeleted = (
      deletedComplaint
    ) => {
      setComplaints((prev) =>
        prev.filter(
          (complaint) =>
            complaint._id !==
            deletedComplaint._id
        )
      );

      addNotification(
        `Complaint #${String(
          deletedComplaint._id
        )
          .slice(-6)
          .toUpperCase()} was deleted`
      );
    };

    socket.on(
      "newComplaint",
      handleNewComplaint
    );

    socket.on(
      "complaintStatusUpdated",
      handleStatusUpdate
    );

    socket.on(
      "complaintDeleted",
      handleComplaintDeleted
    );

    return () => {
      socket.off(
        "newComplaint",
        handleNewComplaint
      );

      socket.off(
        "complaintStatusUpdated",
        handleStatusUpdate
      );

      socket.off(
        "complaintDeleted",
        handleComplaintDeleted
      );
    };
  }, []);

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (
    id,
    newStatus
  ) => {
    try {
      setUpdatingId(id);

      const response = await axios.patch(
        `${BASE_URL}/api/complaints/${id}`,
        {
          status: newStatus,
        }
      );

      const updatedComplaint =
        response.data.complaint ||
        response.data;

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === id
            ? updatedComplaint
            : complaint
        )
      );
    } catch (error) {
      console.error(
        "Failed to update status:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update complaint status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const total = complaints.length;

  const pending = complaints.filter(
    (complaint) =>
      complaint.status?.toLowerCase() ===
      "pending"
  ).length;

  const inProgress = complaints.filter(
    (complaint) =>
      complaint.status?.toLowerCase() ===
      "in progress"
  ).length;

  const resolved = complaints.filter(
    (complaint) =>
      complaint.status?.toLowerCase() ===
      "resolved"
  ).length;

  // =====================================================
  // STATUS CHART
  // =====================================================

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

  // =====================================================
  // PIE CHART
  // =====================================================

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

  const pieColors = [
    "#ef4444",
    "#f59e0b",
    "#22c55e",
  ];

  // =====================================================
  // CATEGORY CHART
  // =====================================================

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

  // =====================================================
  // FILTER
  // =====================================================

  const filteredComplaints =
    filter === "All"
      ? complaints
      : complaints.filter(
          (complaint) =>
            complaint.status?.toLowerCase() ===
            filter.toLowerCase()
        );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agent Portal
            </h1>

            <p className="text-sm text-gray-500">
              Manage and resolve user complaints
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Notification */}

            <div className="relative">

              <button
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
                className="relative p-3 bg-white border rounded-xl hover:bg-gray-50"
              >
                <FiBell className="text-xl text-gray-700" />

                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                    {notifications.length > 99
                      ? "99+"
                      : notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-xl z-50">

                  <div className="flex justify-between items-center px-4 py-3 border-b">

                    <h3 className="font-semibold">
                      Notifications
                    </h3>

                    <button
                      onClick={() =>
                        setShowNotifications(false)
                      }
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <FiX />
                    </button>

                  </div>

                  <div className="max-h-80 overflow-y-auto">

                    {notifications.length === 0 ? (

                      <div className="p-6 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (
                          <div
                            key={notification.id}
                            className="px-4 py-3 border-b hover:bg-gray-50"
                          >

                            <p className="text-sm text-gray-800">
                              {notification.message}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>

                          </div>
                        )
                      )

                    )}

                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t">

                      <button
                        onClick={() => {
                          setNotifications([]);
                          setShowNotifications(false);
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark all as read
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Filters */}

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

          </div>

        </header>

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* CHARTS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Bar Chart */}

          <div className="bg-white rounded-xl shadow-sm border p-6">

            <h2 className="text-lg font-semibold mb-5">
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

          {/* Pie Chart */}

          <div className="bg-white rounded-xl shadow-sm border p-6">

            <h2 className="text-lg font-semibold mb-5">
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
                        key={index}
                        fill={
                          pieColors[index]
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

        {/* ================================================= */}
        {/* CATEGORY CHART */}
        {/* ================================================= */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-lg font-semibold mb-5">
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

        {/* ================================================= */}
        {/* COMPLAINT TABLE */}
        {/* ================================================= */}

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

              <table className="w-full text-left text-sm">

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
                      Status
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

                        <td className="px-6 py-4 font-medium">
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
                            className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  title,
  count,
  icon,
}) => {
  return (
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
};

export default AgentDashboard;