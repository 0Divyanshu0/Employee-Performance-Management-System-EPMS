// src/services/auth.service.js

const API_URL = "http://localhost:5000/api/auth/login";

const login = async (userId, password) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userId, password })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Invalid credentials");
    }

    // --- Normalize backend user data ---
    const normalizedUser = {
      id: result?.user?.id || result?.user?.UserID || null,
      firstName: result?.user?.firstName || result?.user?.FirstName || "",
      lastName: result?.user?.lastName || result?.user?.LastName || "",
      role: result?.user?.role || result?.user?.UserRole || "",
      email: result?.user?.email || result?.user?.Email || ""
    };

    return normalizedUser;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};

const AuthService = { login };
export default AuthService;
