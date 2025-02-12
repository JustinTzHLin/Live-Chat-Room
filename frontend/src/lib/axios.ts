import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // add token to header
    const tokenObj = {
      "just.in.chat.user":
        localStorage.getItem("just.in.chat.user") ||
        sessionStorage.getItem("just.in.chat.user"),
      "just.in.chat.2fa":
        localStorage.getItem("just.in.chat.2fa") ||
        sessionStorage.getItem("just.in.chat.2fa"),
    };
    config.headers.Authorization = `Bearer ${JSON.stringify(tokenObj)}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // add or remove token
    if (response.data.userToken) {
      localStorage.setItem("just.in.chat.user", response.data.userToken);
      sessionStorage.setItem("just.in.chat.user", response.data.userToken);
    } else if (response.data.removeUserToken) {
      localStorage.removeItem("just.in.chat.user");
      sessionStorage.removeItem("just.in.chat.user");
    }
    if (response.data.otpToken) {
      localStorage.setItem("just.in.chat.2fa", response.data.otpToken);
      sessionStorage.setItem("just.in.chat.2fa", response.data.otpToken);
    } else if (response.data.removeOtpToken) {
      localStorage.removeItem("just.in.chat.2fa");
      sessionStorage.removeItem("just.in.chat.2fa");
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
