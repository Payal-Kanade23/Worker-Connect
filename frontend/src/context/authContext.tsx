import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { logoutUser } from "../feature/LoginPage/api/login.api";
import type { Role } from "../api";
import API from "../api";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role | null;

  permissions?: string[];

  is_active?: boolean;
  created_at?: string;
  auth_provider?: string;
  profile_image?: string | null;
  phone?: string;

  // Customer
  user_id?: string;
  default_address?: string;
  latitude?: number;
  longitude?: number;

  // Worker
  employment_type?: string;
  hourly_rate?: number;
  service_radius_km?: number;
  available_from?: string;
  available_to?: string;
  hour_per_day?: number;

  // Rating
  rating_avg?: number;
  is_verified?: boolean;
}



interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  permissions: string[];
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  permissions: [],
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setLoading(true);

      const res = await API.get("/auth/me", {
        withCredentials: true,
      });

      const currentUser: CurrentUser = res.data.data;

      console.log("response by context:", currentUser);

      setUser(currentUser);
      setPermissions(currentUser.permissions ?? []);
    } catch (error) {
      console.error("Failed to fetch current user:", error);

      setUser(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();

      // Clear frontend authentication state
      setUser(null);
      setPermissions([]);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    console.log("🔥 AuthProvider mounted");

    refreshUser();

    return () => {
      console.log("🔥 AuthProvider unmounted");
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        permissions,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);