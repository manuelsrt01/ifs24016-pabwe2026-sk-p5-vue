import { apiPost } from "../../../helpers/apiHelper.js";

export const postLogin = (email, password) => apiPost("/auth/login", { email, password });

export const postRegister = (name, email, password) =>
  apiPost("/auth/register", { name, email, password });
