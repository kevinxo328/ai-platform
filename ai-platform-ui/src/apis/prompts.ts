import { apiClient, getApiUrl } from "../libs/apiClient";

export const fetchGetPrompts = () => {
  const method = "GET";
  const endpoint = "/prompts";
  const key = [method, endpoint];

  const fetchFn = async () => {
    return await apiClient.request({
      method,
      url: getApiUrl(endpoint),
    });
  };

  return {
    key,
    fetchFn,
  };
};
