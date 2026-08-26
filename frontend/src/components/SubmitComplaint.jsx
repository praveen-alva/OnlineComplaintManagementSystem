import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

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
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiPlus,
} from "react-icons/fi";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(BASE_URL);

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userEmail = user.email;

  // =====================================================
  // FETCH ONLY LOGGED-IN USER COMPLAINTS
  // =====================================================

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/complaints`
      );

      const allComplaints =
        res.data.complaints || res.data || [];

      // IMPORTANT:
      // Show only complaints belonging to logged-in user
      const myComplaints = allComplaints.filter(
        (complaint) =>
          complaint.email?.toLowerCase() ===
          userEmail?.toLowerCase()
      );

      setComplaints(myComplaints);
    } catch (error) {
      console.error(
        "Failed to load complaints:",
        error
      );

      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // USE EFFECT
  // =====================================================

  useEffect(() => {
    if (!userEmail) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    fetchMyComplaints();

    // Agent updates complaint status
    const handleStatusUpdate = (updatedComplaint) => {
      // Only update if complaint belongs to this user
      if (
        updatedComplaint.email?.toLowerCase() !==
        userEmail?.toLowerCase()
      ) {
        return;
      }

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === updatedComplaint._id
            ? updatedComplaint
            : item
        )
      );
    };

    // New complaint
    const handleNewComplaint = (newComplaint) => {
      // Only add if this complaint belongs to this user
      if (
        newComplaint.email?.toLowerCase() !==
        userEmail?.toLowerCase()
      ) {
        return;
      }

      setComplaints((prev) => {
        // Prevent duplicate complaint
        const exists = prev.some(
          (item) => item._id === newComplaint._id
        );

        if (exists) {
          return prev;
        }

        return [newComplaint, ...prev];
      });
    };

    socket.on(
      "complaintStatusUpdated",
      handleStatusUpdate
    );

    socket.on(
      "newComplaint",
      handleNewComplaint
    );

    return () => {
      socket.off(
        "complaintStatusUpdated",
        handleStatusUpdate
      );

      socket.off(
        "newComplaint",
        handleNewComplaint
      );
    };
  }, [userEmail]);

  // =====================================================
  // STATISTICS
  // =====================================================

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

  // =====================================================
  // STATUS CHART
  // =====================================================

  const statusChartData = [
    {
      name: "Pending",
      complaints: pending,
    },
    {
      name: "In Progress",
      complaints: inProgress,
    },
    {
      name: "Resolved",
      complaints: resolved,
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

  const categoryChartData = Object.entries(
    categoryCounts
  ).map(([name, complaints]) => ({
    name,
    complaints,
  }));

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";

      case "in progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "pending":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            My Dashboard
          </h1>

          <p className="text-sm text-gray-500">
            Track your submitted complaints in real time
          </p>
        </header>

        {/* USER INFO */}

        {user.name && (
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Welcome
            </p>

            <p className="text-lg font-semibold text-gray-900">
              {user.name}
            </p>
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <StatCard
            title="Total Complaints"
            count={total}
            icon={
              <FiFileText className="text-blue-600" />
            }
          />

          <StatCard
            title="Pending"
            count={pending}
            icon={
              <FiClock className="text-red-600" />
            }
          />

          <StatCard
            title="In Progress"
            count={inProgress}
            icon={
              <FiAlertCircle className="text-yellow-600" />
            }
          />

          <StatCard
            title="Resolved"
            count={resolved}
            icon={
              <FiCheckCircle className="text-green-600" />
            }
          />

        </div>

        {/* NEW COMPLAINT */}

        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Submit a New Complaint
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Have a new issue? Submit your complaint
              and track its status.
            </p>
          </div>

          <Link
            to="/write"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            <FiPlus />
            New Complaint
          </Link>

        </div>

        {/* DATA VISUALIZATION */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* BAR CHART */}

          <div className="bg-white rounded-xl shadow-sm border p-6">

            <h2 className="text-lg font-semibold mb-5">
              Complaint Status
            </h2>

            {total === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No complaint data available
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart data={statusChartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="complaints"
                    name="Complaints"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>
            )}

          </div>

          {/* PIE CHART */}

          <div className="bg-white rounded-xl shadow-sm border p-6">

            <h2 className="text-lg font-semibold mb-5">
              Complaint Distribution
            </h2>

            {total === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No complaint data available
              </div>
            ) : (
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
                          fill={pieColors[index]}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* CATEGORY CHART */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-lg font-semibold mb-5">
            Complaints by Category
          </h2>

          {categoryChartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={categoryChartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="complaints"
                  name="Complaints"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* RECENT COMPLAINTS */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Complaints
          </h2>

          {loading ? (
            <p className="text-center text-gray-500 py-8">
              Loading complaints...
            </p>
          ) : complaints.length === 0 ? (

            <div className="text-center py-10">

              <FiFileText className="mx-auto text-4xl text-gray-300 mb-3" />

              <p className="text-gray-500 mb-4">
                You haven't submitted any complaints yet.
              </p>

              <Link
                to="/write"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiPlus />
                Submit Complaint
              </Link>

            </div>

          ) : (

            <div className="divide-y">

              {complaints.map((item) => (

                <Link
                  key={item._id}
                  to={`/complaint/${item._id}`}
                  className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50 block"
                >

                  <div>

                    <span className="text-xs font-mono text-gray-400">
                      #
                      {String(item._id)
                        .slice(-6)
                        .toUpperCase()}
                    </span>

                    <h3 className="text-sm font-semibold text-gray-800">
                      {item.title || "No Subject"}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {item.category || "General"}
                    </p>

                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${getBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status || "Pending"}
                  </span>

                </Link>

              ))}

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

      <div className="p-3 bg-gray-50 rounded-lg">
        {icon}
      </div>

    </div>
  );
};

export default UserDashboard;