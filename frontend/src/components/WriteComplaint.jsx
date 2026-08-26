import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://smartbridge-project-gvzr.onrender.com";

const WriteComplaint = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "Medium",
    description: "",
    location: "",
    attachments: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        location: formData.location,

        name: user.name || "",
        email: user.email || "",

        attachment: formData.attachments?.name || "",
      };

      // Submit complaint
      const res = await fetch(
        `${BASE_URL}/api/complaints/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Complaint submission failed");
      }

      const data = await res.json();

      const complaint = data.complaint;

      if (!complaint?._id) {
        throw new Error("Complaint ID not received");
      }

      // Send feedback email
      await fetch(
        `${BASE_URL}/api/send-feedback-mail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            complaintTitle: formData.title,
            complaintId: complaint._id,
          }),
        }
      );

      // Save locally
      const localComplaints = JSON.parse(
        localStorage.getItem("complaints") || "[]"
      );

      localStorage.setItem(
        "complaints",
        JSON.stringify([
          ...localComplaints,
          {
            ...complaint,
            id: complaint._id,
          },
        ])
      );

      // Navigate to complaint details
      navigate(`/complaint/${complaint._id}`);

    } catch (error) {
      console.error("❌ Submission failed:", error);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafc] flex items-center justify-center p-6">

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow space-y-6">

        {/* Header */}
        <div className="text-center">

          <h1 className="text-2xl font-semibold">
            Submit a New Complaint
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Provide detailed information to help us resolve it quickly.
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Title */}
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Complaint Title"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Category & Priority */}
          <div className="flex flex-col sm:flex-row gap-4">

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="" disabled>
                Select Category
              </option>

              <option value="Cyber Crime">
                Cyber Crime
              </option>

              <option value="Financial Fraud">
                Financial Fraud
              </option>

              <option value="Consumer">
                Consumer Complaints
              </option>

              <option value="Civic">
                Civic Issues
              </option>

              <option value="Other">
                Other
              </option>
            </select>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Low">Low</option>
            </select>

          </div>

          {/* Description */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full h-32 border rounded-lg px-3 py-2 text-sm resize-none"
            required
          />

          {/* Location */}
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location (Optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          {/* Attachment */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg py-6 text-center">

            <p className="text-sm text-gray-500">
              Upload Attachment (Optional)
            </p>

            <input
              type="file"
              name="attachments"
              onChange={handleChange}
              className="mt-2"
            />

          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-4">

            <button
              type="button"
              onClick={() => navigate("/UserDashboard")}
              className="w-1/2 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>

          </div>

          {/* Back */}
          <div className="text-right">

            <Link
              to="/UserDashboard"
              className="text-blue-600 hover:underline text-sm"
            >
              ← Back to Dashboard
            </Link>

          </div>

        </form>

      </div>

    </div>
  );
};

export default WriteComplaint;