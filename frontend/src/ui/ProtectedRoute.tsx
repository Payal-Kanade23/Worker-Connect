import { ROLES, type Role } from "../api";
import { useAuth } from "../context/authContext";
import { Navigate, Outlet } from "react-router-dom";
import { hasPermission } from "../utils/haspermission";
import { PERMISSIONS } from "../utils/permission";
import { useLocation } from "react-router-dom";
import { ROUTE_PERMISSIONS } from "../utils/permission";
export const ROLE_PERMISSIONS:Record<Role , string[]> = {
  [ROLES.WORKER]: [
    
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMER,
    PERMISSIONS.VIEW_REQUEST,
    PERMISSIONS.ACCEPT_REQUEST,
    PERMISSIONS.REJECT_REQUEST,
   

  ],

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_LOGS,
    // PERMISSIONS.VIEW_BLOG,
    PERMISSIONS.DELETE_USER,
        PERMISSIONS.VIEW_CUSTOMER,


    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_WORKER,
      PERMISSIONS.VIEW_REQUEST,
   

  ],
  [ROLES.CUSTOMER]: [
    
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_WORKER,
    PERMISSIONS.VIEW_REQUEST,
    PERMISSIONS.WITHDRAW_REQUEST,
    PERMISSIONS.BOOK_REQUEST,
    PERMISSIONS.VIEW_PROFILE,
   

  ],

};



export function ProtectedRoute() {
  const location = useLocation();

  const { user, permissions, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permission = ROUTE_PERMISSIONS[location.pathname];

  if (!hasPermission(permissions, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}