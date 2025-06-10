import axios, { type AxiosInstance } from "axios";
import { getBaseURL } from "../../api/haulage-system/config";

function getAuthenticatedClient<ApiClient>(
  apiClient: new (baseUrl?: string, instance?: AxiosInstance) => ApiClient
): ApiClient {
  const axiosInstance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Include cookies in requests
  });

  return new apiClient(getBaseURL(), axiosInstance);
}

export { getAuthenticatedClient };
