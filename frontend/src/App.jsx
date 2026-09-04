import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  // =========================
  // AUTHENTICATION
  // =========================

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // VOUCHERS
  // =========================

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [voucher, setVoucher] = useState({
    voucher_number: "",
    voucher_date: "",
    expense_date: "",
    department: "",
    expense_title: "",
    expense_category: "",
    expense_description: "",
    amount: "",
  });

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }

        setToken(data.token);
        setMessage("Login successful!");

        setEmail("");
        setPassword("");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Cannot connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setVouchers([]);
    setMessage("");
    setError("");
  };

  // =========================
  // VOUCHER INPUT
  // =========================

  const handleVoucherChange = (e) => {
    const { name, value } = e.target;

    setVoucher((previousVoucher) => ({
      ...previousVoucher,
      [name]: value,
    }));
  };

  // =========================
  // CREATE VOUCHER
  // =========================

  const handleCreateVoucher = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/vouchers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voucher),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `Voucher created successfully! Voucher ID: ${data.voucherId}`
        );

        setVoucher({
          voucher_number: "",
          voucher_date: "",
          expense_date: "",
          department: "",
          expense_title: "",
          expense_category: "",
          expense_description: "",
          amount: "",
        });

        getVouchers();
      } else {
        setError(data.message || "Failed to create voucher");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET VOUCHERS
  // =========================

  const getVouchers = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/vouchers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setVouchers(data);
      } else {
        setError(data.message || "Failed to fetch vouchers");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // =========================
  // SUBMIT VOUCHER
  // =========================

  const handleSubmitVoucher = async (voucherId) => {
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/vouchers/${voucherId}/submit`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Voucher submitted successfully.");
        getVouchers();
      } else {
        setError(data.message || "Failed to submit voucher");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // APPROVE VOUCHER
  // =========================

  const handleApproveVoucher = async (voucherId) => {
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/vouchers/${voucherId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Voucher approved successfully.");
        getVouchers();
      } else {
        setError(data.message || "Failed to approve voucher");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REJECT VOUCHER
  // =========================

  const handleRejectVoucher = async (voucherId) => {
    const reason = window.prompt("Enter rejection reason:");

    if (!reason) {
      return;
    }

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/vouchers/${voucherId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejection_reason: reason,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Voucher rejected successfully.");
        getVouchers();
      } else {
        setError(data.message || "Failed to reject voucher");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // MARK VOUCHER AS PAID
  // =========================

  const handleMarkAsPaid = async (voucherId) => {
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/vouchers/${voucherId}/pay`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Voucher marked as paid successfully.");
        getVouchers();
      } else {
        setError(data.message || "Failed to mark voucher as paid");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT AMOUNT
  // =========================

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    return `status status-${status.toLowerCase()}`;
  };

  // =========================
  // LOAD VOUCHERS AFTER LOGIN
  // =========================

  useEffect(() => {
    if (token) {
      getVouchers();
    }
  }, [token, getVouchers]);

  // =========================
  // LOGIN PAGE
  // =========================

  if (!token) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-icon">
            ₹
          </div>

          <h1>Expense Voucher</h1>

          <p className="login-subtitle">
            Expense management made simple
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="primary-button login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <p className="login-footer">
            Secure Expense Voucher Management System
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // ROLE
  // =========================

  const role = user?.role || "employee";

  const roleName =
    role === "director"
      ? "Director"
      : role === "accounts"
      ? "Accounts"
      : "Employee";

  // =========================
  // DASHBOARD COUNTS
  // =========================

  const draftCount = vouchers.filter(
    (v) => v.status === "DRAFT"
  ).length;

  const submittedCount = vouchers.filter(
    (v) => v.status === "SUBMITTED"
  ).length;

  const approvedCount = vouchers.filter(
    (v) => v.status === "APPROVED"
  ).length;

  const paidCount = vouchers.filter(
    (v) => v.status === "PAID"
  ).length;

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div className="app">

      {/* =========================
          TOP NAVBAR
      ========================= */}

      <header className="navbar">

        <div className="brand">
          <div className="brand-icon">₹</div>

          <div>
            <h1>Expense Voucher</h1>
            <span>Management System</span>
          </div>
        </div>

        <div className="user-section">

          <div className="user-info">
            <strong>
              {user?.name || "User"}
            </strong>

            <span>
              {roleName}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="dashboard">

        <div className="welcome-section">

          <div>
            <h2>
              Welcome, {user?.name || "User"} 👋
            </h2>

            <p>
              Manage and track your expense vouchers from here.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={getVouchers}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div>
              <span>Total Vouchers</span>
              <strong>{vouchers.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div>
              <span>Draft</span>
              <strong>{draftCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <span>Submitted</span>
              <strong>{submittedCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div>
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <span>Paid</span>
              <strong>{paidCount}</strong>
            </div>
          </div>

        </div>

        {/* =========================
            MESSAGES
        ========================= */}

        {message && (
          <div className="success-message">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠ {error}
          </div>
        )}

        {/* =========================
            EMPLOYEE CREATE VOUCHER
        ========================= */}

        {role === "employee" && (

          <div className="card">

            <div className="card-heading">
              <div>
                <h2>Create Expense Voucher</h2>
                <p>
                  Enter the details of your expense below.
                </p>
              </div>

              <span className="card-badge">
                New Voucher
              </span>
            </div>

            <form onSubmit={handleCreateVoucher}>

              <div className="form-grid">

                <div className="form-group">
                  <label>Voucher Number *</label>

                  <input
                    type="text"
                    name="voucher_number"
                    placeholder="Example: V003"
                    value={voucher.voucher_number}
                    onChange={handleVoucherChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Voucher Date *</label>

                  <input
                    type="date"
                    name="voucher_date"
                    value={voucher.voucher_date}
                    onChange={handleVoucherChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expense Date *</label>

                  <input
                    type="date"
                    name="expense_date"
                    value={voucher.expense_date}
                    onChange={handleVoucherChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department *</label>

                  <input
                    type="text"
                    name="department"
                    placeholder="Example: IT"
                    value={voucher.department}
                    onChange={handleVoucherChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expense Title *</label>

                  <input
                    type="text"
                    name="expense_title"
                    placeholder="Example: Travel Expense"
                    value={voucher.expense_title}
                    onChange={handleVoucherChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expense Category</label>

                  <select
                    name="expense_category"
                    value={voucher.expense_category}
                    onChange={handleVoucherChange}
                  >
                    <option value="">Select category</option>
                    <option value="Travel">Travel</option>
                    <option value="Office">Office</option>
                    <option value="Food">Food</option>
                    <option value="Accommodation">
                      Accommodation
                    </option>
                    <option value="Transport">
                      Transport
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Expense Description</label>

                  <textarea
                    name="expense_description"
                    placeholder="Describe the expense..."
                    value={voucher.expense_description}
                    onChange={handleVoucherChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Amount (₹) *</label>

                  <input
                    type="number"
                    name="amount"
                    placeholder="Example: 1500"
                    value={voucher.amount}
                    onChange={handleVoucherChange}
                    min="1"
                    required
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "+ Create Voucher"}
                </button>

              </div>

            </form>

          </div>

        )}

        {/* =========================
            VOUCHER LIST
        ========================= */}

        <div className="card">

          <div className="card-heading">

            <div>
              <h2>
                {role === "employee"
                  ? "My Vouchers"
                  : role === "director"
                  ? "Vouchers Awaiting Approval"
                  : "Approved Vouchers"}
              </h2>

              <p>
                {role === "employee"
                  ? "Track the status of your submitted expenses."
                  : role === "director"
                  ? "Review and approve employee expense vouchers."
                  : "Process approved expense vouchers for payment."}
              </p>
            </div>

            <span className="count-badge">
              {vouchers.length} vouchers
            </span>

          </div>

          {vouchers.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>No vouchers found</h3>

              <p>
                There are currently no vouchers to display.
              </p>

            </div>

          ) : (

            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Voucher</th>
                    <th>Expense</th>
                    <th>Department</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {vouchers.map((v) => (

                    <tr key={v.id}>

                      <td>
                        <span className="voucher-id">
                          #{v.id}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {v.voucher_number}
                        </strong>
                      </td>

                      <td>
                        <div className="expense-cell">
                          <strong>
                            {v.expense_title}
                          </strong>

                          <small>
                            {v.expense_category || "General"}
                          </small>
                        </div>
                      </td>

                      <td>
                        {v.department}
                      </td>

                      <td>
                        <strong>
                          ₹{formatAmount(v.amount)}
                        </strong>
                      </td>

                      <td>
                        {formatDate(v.expense_date)}
                      </td>

                      <td>
                        <span className={getStatusClass(v.status)}>
                          {v.status}
                        </span>
                      </td>

                      <td>

                        {/* EMPLOYEE ACTION */}

                        {role === "employee" &&
                          v.status === "DRAFT" && (

                            <button
                              className="action-button submit"
                              onClick={() =>
                                handleSubmitVoucher(v.id)
                              }
                              disabled={loading}
                            >
                              Submit
                            </button>

                          )}

                        {/* DIRECTOR ACTION */}

                        {role === "director" &&
                          v.status === "SUBMITTED" && (

                            <div className="action-group">

                              <button
                                className="action-button approve"
                                onClick={() =>
                                  handleApproveVoucher(v.id)
                                }
                                disabled={loading}
                              >
                                ✓ Approve
                              </button>

                              <button
                                className="action-button reject"
                                onClick={() =>
                                  handleRejectVoucher(v.id)
                                }
                                disabled={loading}
                              >
                                ✕ Reject
                              </button>

                            </div>

                          )}

                        {/* ACCOUNTS ACTION */}

                        {role === "accounts" &&
                          v.status === "APPROVED" && (

                            <button
                              className="action-button pay"
                              onClick={() =>
                                handleMarkAsPaid(v.id)
                              }
                              disabled={loading}
                            >
                              ₹ Mark Paid
                            </button>

                          )}

                        {/* NO ACTION */}

                        {(
                          (role === "employee" &&
                            v.status !== "DRAFT") ||
                          (role === "director" &&
                            v.status !== "SUBMITTED") ||
                          (role === "accounts" &&
                            v.status !== "APPROVED")
                        ) && (
                          <span className="no-action">
                            —
                          </span>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer>
        Expense Voucher Management System © 2026
      </footer>

    </div>
  );
}

export default App;