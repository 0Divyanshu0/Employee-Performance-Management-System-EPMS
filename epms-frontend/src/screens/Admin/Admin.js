import React, { useState, useEffect } from "react";
import "./Admin.css";
import Header from "../../components/Header/Header";
import Button from "../../components/Button/Button"; // GLOBAL BUTTON

const API_BASE_URL = "http://localhost:5000";

const initialFormState = {
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "Employee",
  password: ""
};

const Admin = ({ firstName, userRole, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setEditingUser(null);
    setFormData(initialFormState);
  };

  const mapFromApi = (u) => ({
    userId: u.UserID,
    firstName: u.FirstName,
    lastName: u.LastName,
    email: u.Email || "",
    role: u.UserRole,
    password: ""
  });

  const mapToApi = (data) => ({
    UserID: data.userId,
    FirstName: data.firstName,
    LastName: data.lastName,
    Email: data.email,
    UserRole: data.role,
    ...(data.password && { Password: data.password })
  });



  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();

      // If DB empty, show sample users
      if (data.length === 0) {
        setUsers([
          {
            UserID: "E001",
            FirstName: "John",
            LastName: "Doe",
            Email: "john.doe@example.com",
            UserRole: "Employee"
          },
          {
            UserID: "M001",
            FirstName: "Maria",
            LastName: "Smith",
            Email: "maria.smith@example.com",
            UserRole: "Manager"
          }
        ]);
      } else {
        setUsers(data);
      }
    } catch (err) {
      setError("Could not load user data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    user ? setEditingUser(user) : resetForm();
    setFormData(user ? mapFromApi(user) : initialFormState);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isEdit = !!editingUser;
    if (!isEdit && !formData.password) {
      alert("Password is required for a new user.");
      return;
    }

    const method = isEdit ? "PUT" : "POST";
    const endpoint = isEdit
      ? `/api/users/${editingUser.UserID}`
      : `/api/users`;

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapToApi(formData)),
      });

      if (!res.ok) throw new Error(await res.text());

      const saved = await res.json();

      setUsers((prev) =>
        isEdit
          ? prev.map((u) => (u.UserID === saved.UserID ? saved : u))
          : [...prev, saved]
      );

      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to save user: " + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error();

      setUsers((prev) => prev.filter((u) => u.UserID !== userId));
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-generate email from userId
      if (name === "userId") {
        updated.email = `${value}@gmail.com`;
      }

      return updated;
    });
  };


  return (
    <div className="admin-dashboard">
      <Header
        userName={firstName}
        userRole={userRole}
        onLogout={onLogout}
        showMenuIcon={false}
      />

      <main className="admin-content">
        <h1 className="admin-title"><b>System Administration</b></h1>

        <section className="user-management-section">
          <div className="user-management-header">
            <Button
              size="md"
              color="primary"
              onClick={() => openModal()}
            >
              + Add User
            </Button>
          </div>

          {isLoading && <p className="center-text">Loading...</p>}
          {error && <p className="center-text error">{error}</p>}

          {!isLoading && !error && (
            <div className="user-table-wrapper">
              <table className="user-table">
                <thead className="table-header">
                  <tr>
                    <th>User Name</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length ? (
                    users.map((u) => (
                      <tr key={u.UserID}>
                        <td>{u.UserID}</td>
                        <td>{u.FirstName}</td>
                        <td>{u.LastName}</td>
                        <td>{u.Email}</td>
                        <td>{u.UserRole}</td>

                        {/* Actions Column (EDIT ONLY) */}
                        <td className="action-col">
                          <Button
                            size="sm"
                            color="secondary"
                            className="edit-btn"
                            onClick={() => openModal(u)}
                          >
                            ✏️
                          </Button>
                        </td>

                        {/* Remove Column (DELETE ONLY) */}
                        <td className="remove-col">
                          <Button
                            size="sm"
                            color="danger"
                            className="delete-btn"
                            onClick={() => handleDelete(u.UserID)}
                          >
                            🗑
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="center-text">No users found.</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}
        </section>
      </main>

      {/* ------------------ MODAL ------------------ */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>

            <h3>{editingUser ? "Edit User" : "Add User"}</h3>

            <form onSubmit={handleSave} className="user-form">

              <label>User Name:
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  readOnly={!!editingUser}
                />
              </label>

              <label>First Name:
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  required
                  onChange={handleChange}
                />
              </label>

              <label>Last Name:
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  required
                  onChange={handleChange}
                />
              </label>

              <label>Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  required
                  readOnly
                />
              </label>

              <label>Password {editingUser && "(Optional)"}:
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                />
              </label>

              <label>Role:
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="HR">HR</option>
                  <option value="SystemAdmin">SystemAdmin</option>
                </select>
              </label>

              <div className="modal-actions">
                <Button type="submit" color="primary" size="md">
                  {editingUser ? "Update" : "Add"}
                </Button>

                <Button
                  type="button"
                  color="secondary"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;

