import type { AxiosRequestConfig } from "axios";

const getBaseURL: () => string = () => {
  switch (window.location.hostname) {
    case "localhost":
      return "https://localhost:7041";
    default:
      return "";
  }
};

const getConfig: (token?: string) => AxiosRequestConfig = (authToken) => {
  return {
    baseURL: getBaseURL(),
    timeout: 180000,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    withCredentials: true,
  };
};

export { getConfig, getBaseURL };
