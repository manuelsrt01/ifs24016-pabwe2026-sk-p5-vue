import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia } from "../../../test-utils.js";
import * as userApi from "../api/userApi.js";
import { useUsersStore } from "./usersStore.js";

vi.mock("../api/userApi.js", () => ({
  getUsers: vi.fn(),
  getMe: vi.fn(),
  putMe: vi.fn(),
  postPhoto: vi.fn(),
  putPassword: vi.fn(),
}));

const me = { id: 1, name: "Budi", email: "a@b.co", photo: null };

describe("usersStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("state awal", () => {
    const store = useUsersStore();
    expect(store.users).toEqual([]);
    expect(store.user).toBeNull();
    expect(store.profile).toBeNull();
  });

  it("fetchUsers sukses dan gagal", async () => {
    const store = useUsersStore();
    userApi.getUsers.mockResolvedValue({ message: "ok", data: { users: [me] } });
    const pending = store.fetchUsers();
    expect(store.isUsersLoading).toBe(true);
    expect(await pending).toBe(true);
    expect(store.users).toEqual([me]);
    expect(store.isUsersLoaded).toBe(true);

    userApi.getUsers.mockRejectedValue(new Error("gagal"));
    expect(await store.fetchUsers()).toBe(false);
    expect(store.error).toBe("gagal");
  });

  it("fetchProfile sukses dan gagal", async () => {
    const store = useUsersStore();
    userApi.getMe.mockResolvedValue({ message: "ok", data: { user: me } });
    expect(await store.fetchProfile()).toBe(true);
    expect(store.profile).toEqual(me);
    expect(store.isProfileLoaded).toBe(true);

    userApi.getMe.mockRejectedValue(new Error("Unauthenticated."));
    expect(await store.fetchProfile()).toBe(false);
    expect(store.error).toBe("Unauthenticated.");
  });

  it("changeProfile memperbarui profile", async () => {
    const store = useUsersStore();
    userApi.putMe.mockResolvedValue({ message: "Berhasil mengubah data", data: { user: { ...me, name: "Baru" } } });
    const pending = store.changeProfile("Baru", "a@b.co");
    expect(store.isProfileChange).toBe(true);
    expect(await pending).toBe(true);
    expect(store.profile.name).toBe("Baru");
    expect(store.isProfileChanged).toBe(true);
    expect(userApi.putMe).toHaveBeenCalledWith("Baru", "a@b.co");

    userApi.putMe.mockRejectedValue(new Error("Email dipakai"));
    expect(await store.changeProfile("x", "y")).toBe(false);
    expect(store.error).toBe("Email dipakai");
  });

  it("changePhoto mengunggah lalu memuat ulang profil", async () => {
    const store = useUsersStore();
    const file = new File(["x"], "f.png", { type: "image/png" });
    userApi.postPhoto.mockResolvedValue({ message: "Foto diubah" });
    userApi.getMe.mockResolvedValue({ message: "ok", data: { user: { ...me, photo: "img/new.png" } } });
    const pending = store.changePhoto(file);
    expect(store.isPhotoChange).toBe(true);
    expect(await pending).toBe(true);
    expect(userApi.postPhoto).toHaveBeenCalledWith(file);
    expect(store.profile.photo).toBe("img/new.png");
    expect(store.message).toBe("Foto diubah");
    expect(store.isPhotoChanged).toBe(true);

    userApi.postPhoto.mockRejectedValue(new Error("Bukan gambar"));
    expect(await store.changePhoto(file)).toBe(false);
    expect(store.error).toBe("Bukan gambar");
  });

  it("changePassword sukses dan gagal", async () => {
    const store = useUsersStore();
    userApi.putPassword.mockResolvedValue({ message: "Sandi diubah" });
    const pending = store.changePassword("lama", "baru12", "baru12");
    expect(store.isPasswordChange).toBe(true);
    expect(await pending).toBe(true);
    expect(userApi.putPassword).toHaveBeenCalledWith("lama", "baru12", "baru12");
    expect(store.isPasswordChanged).toBe(true);

    userApi.putPassword.mockRejectedValue(new Error("Sandi lama salah"));
    expect(await store.changePassword("x", "y", "y")).toBe(false);
    expect(store.error).toBe("Sandi lama salah");
  });

  it("selectUser menyimpan pengguna terpilih", () => {
    const store = useUsersStore();
    store.selectUser(me);
    expect(store.user).toEqual(me);
  });
});
