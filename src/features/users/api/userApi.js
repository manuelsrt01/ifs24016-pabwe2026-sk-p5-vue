import { apiGet, apiPost, apiPut } from "../../../helpers/apiHelper.js";

export const getUsers = () => apiGet("/users");

export const getMe = () => apiGet("/users/me");

export const putMe = (name, email) => apiPut("/users/me", { name, email });

export function postPhoto(file) {
  const form = new FormData();
  form.append("photo", file);
  return apiPost("/users/me/photo", form);
}

export const putPassword = (password, newPassword, confirmation) =>
  apiPut("/users/me/password", {
    password,
    new_password: newPassword,
    new_password_confirmation: confirmation,
  });
