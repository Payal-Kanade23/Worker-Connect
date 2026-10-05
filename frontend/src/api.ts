
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const API: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/
API.interceptors.request.use(
  (config) => {
    // Access token is stored in an httpOnly cookie.
    // Browser automatically sends it.
    // No need to manually add Authorization header.

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/
API.interceptors.response.use(
  // Successful response
  (response) => response,

  // Failed response
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? "";

    const isRefreshRequest = url.includes("/auth/refresh");
    const isMeRequest = url.includes("/auth/me");

    /*
    |--------------------------------------------------------------------------
    | 1. Refresh request itself failed
    |--------------------------------------------------------------------------
    |
    | Refresh token is expired/invalid.
    | We cannot refresh anymore.
    |
    */
    if (isRefreshRequest) {
      refreshPromise = null;

      // AuthContext should handle logout/session expiration.
      return Promise.reject(error);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. /auth/me failed
    |--------------------------------------------------------------------------
    |
    | Don't automatically refresh /auth/me.
    | AuthContext can treat this as unauthenticated.
    |
    */
    if (isMeRequest) {
      return Promise.reject(error);
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Request already retried
    |--------------------------------------------------------------------------
    |
    | Prevent infinite:
    | API → 401 → refresh → API → 401 → refresh → ...
    |
    */
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /*
      |--------------------------------------------------------------------------
      | Start refresh only if one isn't already running
      |--------------------------------------------------------------------------
      |
      | If multiple requests receive 401 at the same time,
      | they all wait for the same refresh request.
      |
      */
      if (!refreshPromise) {
        refreshPromise = API.post("/auth/refresh").then(() => {
          // Backend has set a new access_token cookie.
        });
      }

      await refreshPromise;

      /*
      |--------------------------------------------------------------------------
      | Retry original request
      |--------------------------------------------------------------------------
      |
      | Browser automatically sends the new access_token cookie.
      |
      */
      return API(originalRequest);
    } catch (refreshError) {
      /*
      |--------------------------------------------------------------------------
      | Refresh token is expired/invalid
      |--------------------------------------------------------------------------
      |
      | The application should log the user out.
      |
      */
      return Promise.reject(refreshError);
    } finally {
      /*
      | Only clear the shared promise after the refresh operation finishes.
      */
      refreshPromise = null;
    }
  }
);

export default API;
export const ROLES = { 
  WORKER: "worker",
  CUSTOMER: "customer",
  ADMIN: "admin",}as const; // 'admin' excluded — see below
export type Role = (typeof ROLES)[keyof typeof ROLES];


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  password_hash?: string | null; // null for Google-only accounts
  auth_provider?: 'local' | 'google';
  role: Role | null; // null until a fresh Google user picks one
  is_active?: boolean;
  created_at?: Date;
  profile_image?:string
  permissions?:string[]
}