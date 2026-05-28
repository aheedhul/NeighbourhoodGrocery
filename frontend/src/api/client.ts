import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  withCredentials: false
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ng_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
