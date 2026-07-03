import { useState } from "react";
import { signupStyles } from "../assets/dummyStyles";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL as DEFAULT_API_URL } from "../utils/api";

const Signup = ({ API_URL = DEFAULT_API_URL, onSignup }) => {
  const [name, setName] = useState("");
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

  // to validate that all fields are filled by user or not
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  // to signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/user/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data || {};
      const token = data.token ?? null;
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

      if (!profile) {
        profile = { name, email };
      }

      if (!token) {
        setError("Signup failed. No token received.");
        return;
      }

      persistAuth(profile, token);
      if (onSignup) onSignup(profile, rememberMe, token);
      else navigate("/");

      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>
        <div className={signupStyles.header}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={signupStyles.backButton}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className={signupStyles.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className={signupStyles.headerTitle}>Create Account</h1>
          <p className={signupStyles.headerSubtitle}>
            Join Expenso to manage your finances
          </p>
        </div>

        <div className={signupStyles.formContainer}>
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="break-words">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label className={signupStyles.label} htmlFor="signup-name">
                Full name
              </label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className={`${signupStyles.input} ${
                    errors.name ? "border-red-500 focus:ring-red-300 focus:border-red-500" : ""
                  }`}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className={signupStyles.fieldError}>{errors.name}</p>
              )}
            </div>

            <div className="mb-5">
              <label className={signupStyles.label} htmlFor="signup-email">
                Email address
              </label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className={`${signupStyles.input} ${
                    errors.email ? "border-red-500 focus:ring-red-300 focus:border-red-500" : ""
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className={signupStyles.fieldError}>{errors.email}</p>
              )}
            </div>

            <div className="mb-5">
              <label className={signupStyles.label} htmlFor="signup-password">
                Password
              </label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  className={`${signupStyles.passwordInput} ${
                    errors.password ? "border-red-500 focus:ring-red-300 focus:border-red-500" : ""
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={signupStyles.passwordToggle}
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
                <p className={signupStyles.fieldError}>{errors.password}</p>
              )}
            </div>

            <div className={signupStyles.checkboxContainer}>
              <input
                id="remember-me-signup"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={signupStyles.checkbox}
              />
              <label
                htmlFor="remember-me-signup"
                className={signupStyles.checkboxLabel}
              >
                Remember Me 
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${signupStyles.button} ${
                isLoading ? signupStyles.buttonDisabled : ""
              }`}
            >
              {isLoading ? (
                <>
                  <svg className={signupStyles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className={signupStyles.signInContainer}>
            <p className={signupStyles.signInText}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={signupStyles.signInLink}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
