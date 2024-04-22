import { ReqLLMChat, ResLLMChat, ResLLMModelList } from "@/types/llm";
import { apiClient, getApiUrl } from "../libs/apiClient";

export const fetchPostLLMChat = () => {
  const method = "POST";
  const endpoint = "/llm/chat";
  const key = [method, endpoint];

  const fetchFn = async (data: ReqLLMChat) => {
    return await apiClient.request<ResLLMChat>({
      method,
      url: getApiUrl(endpoint),
      data,
    });
  };

  return {
    key,
    fetchFn,
  };
};

export const fetchGetLLMModelList = () => {
  const method = "GET";
  const endpoint = "/llm/models";
  const key = [method, endpoint];
  const fetchFn = async () => {
    return await apiClient.request<ResLLMModelList>({
      url: getApiUrl(endpoint),
    });
  };

  return {
    key,
    fetchFn,
  };
};
