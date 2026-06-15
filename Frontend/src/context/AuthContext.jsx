/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  const normalized = { ...user };
  if (normalized.id && !normalized._id) normalized._id = normalized.id;
  if (normalized._id && !normalized.id) normalized.id = normalized._id;
  return normalized;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = (userData) => {
    localStorage.setItem("isLoggedIn", "true");
    setUser(normalizeUser(userData));
  };

  const clearSession = () => {
    localStorage.removeItem("isLoggedIn");
    setUser(null);
  };

  const refreshUser = async () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getMe();
      setUser(normalizeUser(response.data));
    } catch (error) {
      console.error("Failed to refresh user session:", error);
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleLogoutEvent = () => {
      clearSession();
    };
    window.addEventListener("auth-logout", handleLogoutEvent);

    refreshUser();

    return () => {
      window.removeEventListener("auth-logout", handleLogoutEvent);
    };
  }, []);

  const login = async (payload) => {
    const response = await api.login(payload);
    if (response.success) {
      setSession(response.user);
      try {
        const me = await api.getMe();
        setUser(normalizeUser(me.data));
      } catch (error) {
        console.error("Failed to hydrate logged-in user:", error);
      }
    }
    return response;
  };

  const signup = async (payload) => {
    const response = await api.signup(payload);
    return response;
  };

  const verifyEmail = async (token) => {
    const response = await api.verifyEmail(token);
    if (response.success) {
      setSession(response.user);
      try {
        const me = await api.getMe();
        setUser(normalizeUser(me.data));
      } catch (error) {
        console.error("Failed to hydrate verified user:", error);
      }
    }
    return response;
  };

  const checkVerification = async (email) => {
    const response = await api.checkVerification(email);
    if (response.success) {
      setSession(response.user);
      try {
        const me = await api.getMe();
        setUser(normalizeUser(me.data));
      } catch (error) {
        console.error("Failed to hydrate verified user:", error);
      }
    }
    return response;
  };

  const resendVerification = async (email) => {
    return api.resendVerification(email);
  };

  const forgotPassword = async (email) => {
    return api.forgotPassword(email);
  };

  const resetPassword = async (payload) => {
    const response = await api.resetPassword(payload);
    if (response.success) {
      setSession(response.user);
      try {
        const me = await api.getMe();
        setUser(normalizeUser(me.data));
      } catch (error) {
        console.error("Failed to hydrate reset-password user:", error);
      }
    }
    return response;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Failed calling logout API:", error);
    } finally {
      clearSession();
    }
  };

  const updateUser = (userData) => {
    setUser(normalizeUser(userData));
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      verifyEmail,
      checkVerification,
      resendVerification,
      forgotPassword,
      resetPassword,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
