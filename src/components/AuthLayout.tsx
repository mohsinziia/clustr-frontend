import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Hits the /current-user route protected by verifyJWT
        const res = await api.get("/users/current-user");
        if (!user) {
          login({ user: res.data.data });
        }
        setLoader(false);
      } catch (error) {
        // If token is invalid or missing, backend throws ApiError 401
        navigate("/register");
      }
    };
    checkAuth();
  }, [navigate, login, user]);

  return loader ? <div>Loading...</div> : <>{children}</>;
};
