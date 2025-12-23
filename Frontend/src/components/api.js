import axios from "axios";
import { USER_API_END_POINT } from "../utils/apiEndpoint.js";

const api = axios.create({
  baseURL: USER_API_END_POINT,
  withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);
