import axios from "axios";

export const getApiUrl = (url: string) => {
  return import.meta.env.VITE_APP_API_BASE_URL + "/api" + url;
};
export const apiClient = axios.create();
