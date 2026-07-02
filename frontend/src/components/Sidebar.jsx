import { useRef, useState, useEffect, useCallback } from "react";
import { sidebarStyles, cn } from "../assets/dummyStyles";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Home, ArrowUp, ArrowDown, User, HelpCircle, LogOut, Menu, X } from "lucide-react";
import axios from "axios";

const API_BASE = "https://expenso-backend-8529.onrender.com/api";

const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: <Home size={20} /> },
  { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
  { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
  { text: "Profile", path: "/profile", icon: <User size={20} /> },
];


const Sidebar = ({ user: propUser, onLogout, isCollapsed, setIsCollapsed }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mobileSidebarRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [user, setUser] = useState(propUser || null);

  const loadUser = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (token) {
        const res = await axios.get(`${API_BASE}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data?.user ?? res.data;
        setUser(userData);
        return;
      }

      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to load sidebar profile", err);
      const stored =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const refreshUser = () => loadUser();
    window.addEventListener("user-updated", refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.removeEventListener("user-updated", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, [loadUser]);

  useEffect(() => {
    if (!propUser) {
      const fetchUser = async () => {
        await loadUser();
      };
      fetchUser();
    }
  }, [propUser, pathname, loadUser]);

  const currentUser = propUser || user;
  const { name: username = "User", email = "" } = currentUser || {};
  const initial = (username.charAt(0) || "U").toUpperCase();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/login");
    }
  };

  const toggleSidebar= () => { setIsCollapsed(prev => !prev);};

  const renderMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;
    return (
      <motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
            isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >
          <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
            {icon}
          </span>
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {text}
            </motion.span>
          )}
          {activeHover === text && !isActive && !isCollapsed && (
            <span className={sidebarStyles.activeIndicator}></span>
          )}
        </Link>
      </motion.li>
    );
  };

  const renderMobileMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;
    return (
      <li key={text}>
        <Link
          to={path}
          onClick={() => setMobileOpen(false)}
          className={cn(
            sidebarStyles.mobileMenuItem.base,
            isActive
              ? sidebarStyles.mobileMenuItem.active
              : sidebarStyles.mobileMenuItem.inactive
          )}
        >
          <span
            className={
              isActive
                ? sidebarStyles.menuIcon.active
                : sidebarStyles.menuIcon.inactive
            }
          >
            {icon}
          </span>
          <span>{text}</span>
        </Link>
      </li>
    );
  };

  return (
    <>
     <motion.div className={sidebarStyles.sidebarContainer.base}
       initial={{x: -100, opacity:0}}
       animate={{
        x: 0,
        opacity: 1,
        width: isCollapsed ? 64 : 256,
        }} transition={{type: "spring", damping: 25}}>
          <div className={sidebarStyles.sidebarInner.base}>
            <button onClick={toggleSidebar} className= {sidebarStyles.toggleButton.base}>
              <motion.div
               initial={{ rotate: 0 }}
               animate={{ rotate: isCollapsed ? 0 : 180 }}
               transition={{ duration: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" 
                width="16" height="16"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round">
                 <polyline points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}>
                 </polyline>
                </svg>
              </motion.div>
            </button>
            <div className={cn(
              sidebarStyles.userProfileContainer.base,
              isCollapsed ? sidebarStyles.userProfileContainer.collapsed:
              sidebarStyles.userProfileContainer.expanded,
              )}>
                <div className="flex items-center">
                  <div className={sidebarStyles.userInitials.base}>
                    {initial}
                  </div>
                  {!isCollapsed && (
                    <motion.div 
                      className="ml-3 overflow-hidden"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <h2 className="text-sm font-bold text-gray-800 truncate">
                        {username}
                      </h2>
                      <p className="text-xs text-gray-500 truncate">
                        {email || "you@example.com"}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <ul className={sidebarStyles.menuList.base}>
                  {MENU_ITEMS.map(renderMenuItem)}
                </ul>
              </div>
              <div className={cn(
                sidebarStyles.footerContainer.base,
                isCollapsed ? sidebarStyles.footerContainer.collapsed : 
                sidebarStyles.footerContainer.expanded,
              )}>
                <Link className={cn(
                  sidebarStyles.footerLink.base,
                  isCollapsed && sidebarStyles.footerLink.collapsed,
                )}
                to="https://hexagondigitalservices.com/contact">
                  <HelpCircle size={20} className="text-gray-500"/>
                  {!isCollapsed && <span>Support</span>}
                </Link>
                <button onClick={handleLogout} className={cn(
                  sidebarStyles.logoutButton.base,
                  isCollapsed && sidebarStyles.logoutButton.collapsed
                )}>
                  <LogOut size={20} className="text-gray-500"/>
                  {!isCollapsed && <span>Logout</span>}
                </button>

              </div>
          </div>
      </motion.div>  

      <motion.button onClick={() => setMobileOpen((prev) => !prev)}
        className={sidebarStyles.mobileMenuButton}
        whileHover={{scale: 1.05}}
        whileTap={{scale: 0.95}}>
          {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
        </motion.button>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
            className={sidebarStyles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={sidebarStyles.mobileBackdrop}
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
              <motion.div
               ref={mobileSidebarRef}
               className={sidebarStyles.mobileSidebar.base}
               initial={{ x: "-100%" }}
               animate={{ x: 0 }}
               exit={{ x: "-100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}>
                <div className="relative h-full flex flex-col">

                  {/* User profile - shown above Dashboard menu */}
                  <div className="flex items-center justify-between gap-3 w-full px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(sidebarStyles.userInitials.base, "shrink-0")}>
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-gray-800 font-bold truncate">
                          {username}
                        </h2>
                        <p className="text-sm text-gray-500 truncate">
                          {email || "No email set"}
                        </p>
                      </div>
                    </div>

                    <button onClick={() => setMobileOpen(false)}
                      className="shrink-0 p-1 rounded-md hover:bg-gray-100">
                        <X size={24} className="text-gray-600"/>
                      </button>
                  </div>

                  {/* Menu items (Dashboard, Income, Expenses, Profile) */}
                  <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <ul className={sidebarStyles.mobileMenuList}>
                      {MENU_ITEMS.map(renderMobileMenuItem)}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className={cn(sidebarStyles.footerContainer.base, sidebarStyles.footerContainer.expanded)}>
                    <Link className={sidebarStyles.footerLink.base}
                      to="https://hexagondigitalservices.com/contact"
                      onClick={() => setMobileOpen(false)}>
                      <HelpCircle size={20} className="text-gray-500"/>
                      <span>Support</span>
                    </Link>
                    <button onClick={handleLogout} className={sidebarStyles.logoutButton.base}>
                      <LogOut size={20} className="text-gray-500"/>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
    </>
  )
}

export default Sidebar;
