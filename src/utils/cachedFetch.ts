import axios from "axios";
import {
  AxiosCacheInstance,
  buildWebStorage,
  setupCache,
} from "axios-cache-interceptor";
import { config } from "../config";

const axiosInstances = new Map();

export const createCachedFetch = (prefix: string): AxiosCacheInstance => {
  if (axiosInstances.has(prefix)) {
    return axiosInstances.get(prefix);
  }

  const axiosInstance = setupCache(axios.create(), {
    storage: buildWebStorage(localStorage, prefix),
    headerInterpreter: () => config.API_CACHE_MS,
  });

  axiosInstances.set(prefix, axiosInstance);

  return axiosInstance;
};
