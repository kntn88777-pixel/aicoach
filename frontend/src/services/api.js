import axios from "axios";

const api = axios.create({
    baseURL: "https://aicoach-z4ca.onrender.com"
});

export default api;