import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const ComplaintListByStatus = () => {
  const { status } = useParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logged-in user
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userEmail = user.email;

  // =====================================================
  // FETCH USER COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/api/complaints`
      );

      const allComplaints =
        res.data.complaints || res.data || [];

      // Only logged-in user's complaints
      const myComplaints = allComplaints.filter(
        (complaint) =>
          complaint.email?.toLowerCase() ===
          userEmail?.toLowerCase()
      );

      // Filter by status
      const filtered =
        status?.toLowerCase() === "all"
          ? myComplaints
          : myComplaints.filter(
              (complaint) =>
                complaint.status?.toLowerCase() ===
                status?.toLowerCase()
            );

      setComplaints(filtered);
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

    fetchComplaints();
  }, [status, userEmail]);

  // =====================================================
  // DELETE COMPLAINT
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${BASE_URL}/api/complaints/${id}`
      );

      // Remove from current UI
      setComplaints((prev) =>
        prev.filter(
          (complaint) => complaint._id !== id
        )
      );

      alert("Complaint deleted successfully");
    } catch (error) {
      console.error(
        "Delete complaint error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete complaint"
      );
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusClass = (complaintStatus) => {
    switch (
      complaintStatus?.toLowerCase()
    ) {
      case "pending":
        return "bg-red-100 text-red-700 border-red-200";

      case "in progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const pageTitle =
    status?.toLowerCase() === "all"
      ? "All Complaints"
      : `${status} Complaints`;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#f9fafc] px-4 py-6">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {pageTitle}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View and manage your complaints
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="bg-white rounded-xl border p-10 text-center">
            <p className="text-gray-500">
              Loading complaints...
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          complaints.length === 0 && (
            <div className="bg-white rounded-xl border p-10 text-center">

              <p className="text-gray-500 mb-4">
                No complaints found for "{status}".
              </p>

              <Link
                to="/write"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                Submit New Complaint
              </Link>

            </div>
          )}

        {/* COMPLAINTS */}

        {!loading &&
          complaints.length > 0 && (
            <div className="space-y-4">

              {complaints.map((complaint) => (

                <div
                  key={complaint._id}
                  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >

                  <div className="flex flex-col sm:flex-row justify-between gap-4">

                    {/* DETAILS */}

                    <div className="flex-1">

                      <div className="flex items-center gap-2 mb-2">

                        <span className="text-xs font-mono text-gray-400">
                          #
                          {String(
                            complaint._id
                          )
                            .slice(-6)
                            .toUpperCase()}
                        </span>

                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          {complaint.status ||
                            "Pending"}
                        </span>

                      </div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        {complaint.title ||
                          "No Title"}
                      </h2>

                      <p className="text-sm text-gray-600 mt-2">
                        {complaint.description
                          ? complaint.description.length >
                            100
                            ? `${complaint.description.slice(
                                0,
                                100
                              )}...`
                            : complaint.description
                          : "No description"}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">

                        <span>
                          Category:{" "}
                          {complaint.category ||
                            "General"}
                        </span>

                        <span>
                          Priority:{" "}
                          {complaint.priority ||
                            "Medium"}
                        </span>

                        <span>
                          Date:{" "}
                          {complaint.date ||
                            "N/A"}
                        </span>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="flex sm:flex-col items-center sm:items-end gap-3">

                      <Link
                        to={`/complaint/${complaint._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details →
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            complaint._id
                          )
                        }
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

        {/* BACK */}

        <div className="mt-6">

          <Link
            to="/dashboard"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ComplaintListByStatus;