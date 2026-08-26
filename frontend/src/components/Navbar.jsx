import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Check logged-in user / agent
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      const agentRaw = localStorage.getItem("agent");

      let loggedUser = null;

      // Check User
      if (
        userRaw &&
        userRaw !== "undefined" &&
        userRaw !== "null"
      ) {
        loggedUser = JSON.parse(userRaw);

        if (loggedUser?.name) {
          setIsLoggedIn(true);
          setUserName(loggedUser.name);
          setAccountType("user");
          return;
        }
      }

      // Check Agent
      if (
        agentRaw &&
        agentRaw !== "undefined" &&
        agentRaw !== "null"
      ) {
        loggedUser = JSON.parse(agentRaw);

        if (loggedUser?.name) {
          setIsLoggedIn(true);
          setUserName(loggedUser.name);
          setAccountType("agent");
          return;
        }
      }

      // No user logged in
      setIsLoggedIn(false);
      setUserName("");
      setAccountType("");

    } catch (error) {
      console.error("Failed to parse user:", error);

      setIsLoggedIn(false);
      setUserName("");
      setAccountType("");
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("agent");
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setUserName("");
    setAccountType("");
    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/");
  };

  // Dashboard based on account type
  const dashboardPath =
    accountType === "agent"
      ? "/AgentDashboard"
      : "/UserDashboard";

  return (
    <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-2 text-blue-600 text-xl font-bold hover:opacity-80 transition"
        >
          <i className="fa-solid fa-shield-halved"></i>
          <span>ResolveNow</span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center">

          {!isLoggedIn ? (
            <div className="flex items-center gap-3">

              <Link
                to="/login"
                className="border border-blue-600 text-blue-600 px-5 py-2 rounded-md font-semibold hover:bg-blue-600 hover:text-white transition"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Register
              </Link>

            </div>
          ) : (

            /* Profile */
            <div
              className="relative"
              ref={profileRef}
            >

              {/* Profile Button */}
              <button
                onClick={() =>
                  setProfileOpen(!profileOpen)
                }
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition"
              >

                {/* Profile Icon */}
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <i className="fa-solid fa-user"></i>
                </div>

                {/* Arrow */}
                <i
                  className={`fa-solid ${
                    profileOpen
                      ? "fa-chevron-up"
                      : "fa-chevron-down"
                  } text-gray-500 text-sm`}
                ></i>

              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">

                  {/* Profile Information */}
                  <div className="px-4 py-4 bg-blue-50 border-b">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <i className="fa-solid fa-user"></i>
                      </div>

                      <div>

                        <p className="text-xs text-gray-500">
                          Welcome
                        </p>

                        <p className="font-semibold text-gray-800">
                          {userName}
                        </p>

                        <p className="text-xs text-blue-600 capitalize">
                          {accountType}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Dashboard */}
                  <Link
                    to={dashboardPath}
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                  >
                    <i className="fa-solid fa-chart-line text-blue-600"></i>

                    <span>Dashboard</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>

                    <span>Logout</span>
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-blue-600 text-2xl"
        >
          <i
            className={
              menuOpen
                ? "fa-solid fa-xmark"
                : "fa-solid fa-bars"
            }
          ></i>
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden mt-4 border-t pt-4">

          {!isLoggedIn ? (
            <div className="flex flex-col gap-3">

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="border border-blue-600 text-blue-600 px-5 py-2 rounded-md text-center font-semibold"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="bg-blue-600 text-white px-5 py-2 rounded-md text-center font-semibold"
              >
                Register
              </Link>

            </div>
          ) : (
            <div className="flex flex-col gap-2">

              {/* User Information */}
              <div className="flex items-center gap-3 px-3 py-3 bg-blue-50 rounded-md">

                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <i className="fa-solid fa-user"></i>
                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Logged in as
                  </p>

                  <p className="font-semibold">
                    {userName}
                  </p>

                  <p className="text-xs text-blue-600 capitalize">
                    {accountType}
                  </p>

                </div>

              </div>

              {/* Dashboard */}
              <Link
                to={dashboardPath}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-md"
              >
                <i className="fa-solid fa-chart-line text-blue-600"></i>

                Dashboard
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-md"
              >
                <i className="fa-solid fa-right-from-bracket"></i>

                Logout
              </button>

            </div>
          )}

        </div>
      )}
    </header>
  );
};

export default Navbar;