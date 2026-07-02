import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navbarStyles } from "../assets/dummyStyles";
import { ChevronDown, User, LogOut } from "lucide-react";
import img1 from "../assets/logo.png";
import axios from 'axios';

const BASE_URL='https://expenso-backend-8529.onrender.com/api'

const Navbar = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const menuRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const activeUser = propUser || user;

  useEffect(() => {
    if (propUser) return;

    const fetchUserData = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data.user || response.data;
        setUser(userData);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    fetchUserData();
  }, [propUser]);

  useEffect(() => {
    const refreshUser = async () => {
      if (propUser) return;
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user || response.data);
      } catch (error) {
        console.error("Failed to refresh profile", error);
      }
    };

    window.addEventListener("user-updated", refreshUser);
    return () => window.removeEventListener("user-updated", refreshUser);
  }, [propUser]);


  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    onLogout?. ();
    navigate("/login");
  };

  //closes the toogle menu if click outside the box 
   useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  //console.log("Navbar User:", user);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className={navbarStyles.logoContainer}
        >
          <div>
          <img src={img1} alt="logo" 
          className="w-10 h-10 object-container" />
          </div>
          <span className={navbarStyles.logoText}>Expenso</span>
        </div>

        {/* if the user is present */}
        {activeUser && (
            <div
            className={navbarStyles.userContainer} ref={menuRef}>
             <button
              onClick={toggleMenu}
              className={navbarStyles.userButton}>
              <div className="relative">
                <div className={navbarStyles.userAvatar}>
                  {activeUser?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className={navbarStyles.statusIndicator}></div>
              </div>
              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName}>
                  {activeUser?.name || "User"}</p>
                <p className={navbarStyles.userEmail}>
                  {activeUser?.email || "user@expensetracker.com"}
                </p>
              </div>
              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>

            {/*dropdown menu */}
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                <div className={navbarStyles.dropdownHeader}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={navbarStyles.userAvatar}>
                        {activeUser?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    </div>

                    <div>
                      <div className={navbarStyles.dropdownName}>
                        {activeUser?.name || "User"}
                      </div>

                      <div className={navbarStyles.dropdownEmail}>
                        {activeUser?.email || "user@expensetracker.com"}
                      </div>
                    </div>
                  </div>
                </div> 
                <div className={navbarStyles.menuItemContainer}>
                  <button onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }} className={navbarStyles.menuItem}>
                    <User className="w-4 h-4"/>
                    <span>My Profile</span>
                  </button>
                </div>
                <div className={navbarStyles.menuItemBorder}>
                  <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                    <LogOut className="w-4 h-4"/>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
