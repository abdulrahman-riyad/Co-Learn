import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from "axios";

/**
 * Make a delayed Axios request
 *
 * @param url - The request URL
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param headers - Optional request headers
 * @param data - Optional request body data
 * @param options - Additional Axios request config
 * @param delayTime - Delay before request (ms), default = 1000
 */
export async function DelayedRequest<T = any>(
  url: string,
  method: AxiosRequestConfig["method"] = 'GET',
  headers: any,
  data: any = null,
  options: AxiosRequestConfig = {},
  delayTime: number = 1000
): Promise<AxiosResponse<T>> {
  // Wait before making request
  await new Promise((resolve) => setTimeout(resolve, delayTime));

  const response = await axios({
    url,
    method,
    headers: headers as AxiosRequestHeaders,
    data,
    ...options,
  });

  return response;
}
