import { defineStore } from "pinia";
import { ref } from "vue";
import { createRunner } from "../../../helpers/storeHelper.js";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi.js";

export const useUsersStore = defineStore("users", () => {
  const { error, message, run } = createRunner();

  const users = ref([]);
  const user = ref(null); // pengguna yang dipilih di halaman daftar
  const profile = ref(null); // profil akun yang sedang login

  const isUsersLoading = ref(false);
  const isUsersLoaded = ref(false);
  const isProfileLoading = ref(false);
  const isProfileLoaded = ref(false);
  const isProfileChange = ref(false);
  const isProfileChanged = ref(false);
  const isPhotoChange = ref(false);
  const isPhotoChanged = ref(false);
  const isPasswordChange = ref(false);
  const isPasswordChanged = ref(false);

  const fetchUsers = () =>
    run(isUsersLoading, isUsersLoaded, async () => {
      const response = await getUsers();
      users.value = response.data.users;
      return response.message;
    });

  const fetchProfile = () =>
    run(isProfileLoading, isProfileLoaded, async () => {
      const response = await getMe();
      profile.value = response.data.user;
      return response.message;
    });

  const changeProfile = (name, email) =>
    run(isProfileChange, isProfileChanged, async () => {
      const response = await putMe(name, email);
      profile.value = response.data.user;
      return response.message;
    });

  const changePhoto = (file) =>
    run(isPhotoChange, isPhotoChanged, async () => {
      const response = await postPhoto(file);
      const me = await getMe();
      profile.value = me.data.user;
      return response.message;
    });

  const changePassword = (password, newPassword, confirmation) =>
    run(isPasswordChange, isPasswordChanged, async () => {
      const response = await putPassword(password, newPassword, confirmation);
      return response.message;
    });

  function selectUser(selected) {
    user.value = selected;
  }

  return {
    error,
    message,
    users,
    user,
    profile,
    isUsersLoading,
    isUsersLoaded,
    isProfileLoading,
    isProfileLoaded,
    isProfileChange,
    isProfileChanged,
    isPhotoChange,
    isPhotoChanged,
    isPasswordChange,
    isPasswordChanged,
    fetchUsers,
    fetchProfile,
    changeProfile,
    changePhoto,
    changePassword,
    selectUser,
  };
});
