import { useState } from "react";
import { loginStyles } from "../assets/dummyStyles";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ onLogin, API_URL = "http://localhost:4000" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // to fetch profile
  const fetchProfile = async (token) => {
    if (!token) return null;
    const res = await axios.get(`${API_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.user ?? res.data;
  };

  const persistAuth = (profile, token) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    try {
      if (token) storage.setItem("token", token);
      if (profile) storage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      console.error("Storage Error:", err);
    }
  };

  // to validate fields
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  // to login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/user/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data || {};
      const token = data.token || null;

      // to derive user profile
      let profile = data.user ?? null;
      if (!profile) {
        const copy = { ...data };
        delete copy.token;
        delete copy.user;
        delete copy.success;
        delete copy.message;

        if (Object.keys(copy).length) {
          profile = copy;
        }
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (profileErr) {
          console.error("Profile fetch error:", profileErr);
        }
      }

      if (!token) {
        setError("Login failed. No token received.");
        return;
      }

      persistAuth(profile, token);
      if (onLogin) onLogin(profile, rememberMe, token);
      else navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={loginStyles.pageContainer}>
      <div className={loginStyles.cardContainer}>
        <div className={loginStyles.header}>
          <div className={loginStyles.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className={loginStyles.headerTitle}>Welcome back</h1>
          <p className={loginStyles.headerSubtitle}>
            Sign in to track your expenses
          </p>
        </div>

        <div className={loginStyles.formContainer}>
          {error && (
            <div className={loginStyles.errorContainer}>
              <div className={loginStyles.errorIcon}>
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className={loginStyles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label className={loginStyles.label} htmlFor="login-email">
                Email address
              </label>
              <div className={loginStyles.inputContainer}>
                <span className={loginStyles.inputIcon}>
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className={`${loginStyles.input} ${
                    errors.email ? "border-red-500 focus:ring-red-300 focus:border-red-500" : ""
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="mb-5">
              <label className={loginStyles.label} htmlFor="login-password">
                Password
              </label>
              <div className={loginStyles.inputContainer}>
                <span className={loginStyles.inputIcon}>
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  className={`${loginStyles.passwordInput} ${
                    errors.password ? "border-red-500 focus:ring-red-300 focus:border-red-500" : ""
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={loginStyles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className={loginStyles.checkboxContainer}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={loginStyles.checkbox}
              />
              <label htmlFor="remember-me" className={loginStyles.checkboxLabel}>
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${loginStyles.button} ${
                isLoading ? loginStyles.buttonDisabled : ""
              }`}
            >
              {isLoading ? (
                <>
                  <span className={loginStyles.spinner} />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className={loginStyles.signUpContainer}>
            <p className={loginStyles.signUpText}>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className={loginStyles.signUpLink}
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
