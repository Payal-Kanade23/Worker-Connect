import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const location = useLocation();
  const hideSidebar = location.pathname == "/login" || location.pathname == "/register" || location.pathname == "/";

  return (
    <>
 <Navbar/>
      {/* Sidebar */}
      {!hideSidebar && <Sidebar />}

      {/* Main content */}
        <div className=" px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
    </>
     
    
  );
}

export default DashboardLayout;