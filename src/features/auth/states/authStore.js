import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper.js";
import { createRunner } from "../../../helpers/storeHelper.js";
import { postLogin, postRegister } from "../api/authApi.js";

export const useAuthStore = defineStore("auth", () => {
  const { error, message, run } = createRunner();

  const token = ref(getAccessToken());
  const isAuthLogin = ref(false); // sedang proses login
  const isAuthLoggedIn = ref(false); // login berhasil
  const isAuthRegister = ref(false); // sedang proses register
  const isAuthRegistered = ref(false); // register berhasil
  const isAuthLogout = ref(false); // sudah logout

  const isAuthenticated = computed(() => Boolean(token.value));

  const login = (email, password) =>
    run(isAuthLogin, isAuthLoggedIn, async () => {
      const response = await postLogin(email, password);
      token.value = response.data.token;
      putAccessToken(token.value);
      isAuthLogout.value = false;
      return response.message;
    });

  const register = (name, email, password) =>
    run(isAuthRegister, isAuthRegistered, async () => {
      const response = await postRegister(name, email, password);
      return response.message;
    });

  function logout() {
    removeAccessToken();
    token.value = null;
    isAuthLoggedIn.value = false;
    isAuthLogout.value = true;
  }

  return {
    token,
    error,
    message,
    isAuthenticated,
    isAuthLogin,
    isAuthLoggedIn,
    isAuthRegister,
    isAuthRegistered,
    isAuthLogout,
    login,
    register,
    logout,
  };
});
