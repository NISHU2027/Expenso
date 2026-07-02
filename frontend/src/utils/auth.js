export const getStoredToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken")
    );
  } catch (err) {
    console.error("Failed to read auth token:", err);
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
