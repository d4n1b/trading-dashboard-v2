import axios, { AxiosError } from "axios";

export const authenticatedFetch = axios.create();

authenticatedFetch.interceptors.request.use((config) => {
  if (config.headers) {
    const token = localStorage.getItem("token") || "";
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authenticatedFetch.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers["authorization"];

    if (typeof refreshedToken === "string") {
      localStorage.setItem("token", refreshedToken);
    }

    return response;
  },
  (error: AxiosError) => {
    const shouldRemoveToken =
      (error.response?.status && [401, 403].includes(error.response.status)) ||
      error.code === "ERR_NETWORK";
    if (shouldRemoveToken) {
      localStorage.removeItem("token");
    }

    const shouldRefresh =
      error.response?.config.url?.includes("/auth") ||
      !localStorage.getItem("token");
    if (shouldRefresh) {
      window.location.reload();
    }

    throw error;
  }
);
