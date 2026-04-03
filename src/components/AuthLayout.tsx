import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [loader, setLoader] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Hits the /current-user route protected by verifyJWT
        await api.get("/users/current-user");
        setLoader(false);
      } catch (error) {
        // If token is invalid or missing, backend throws ApiError 401
        navigate("/register");
      }
    };
    checkAuth();
  }, [navigate]);

  return loader ? <div>Loading...</div> : <>{children}</>;
};
