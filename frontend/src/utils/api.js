import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

export function getHealth() {
  return apiClient.get("/health");
}
