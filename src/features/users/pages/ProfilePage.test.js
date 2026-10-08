import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useUsersStore } from "../states/usersStore.js";
import ProfilePage from "./ProfilePage.vue";

const profile = { id: 1, name: "Budi", email: "budi@x.co", photo: "img/profile/1.png" };

async function setup({ withProfile = true, ok = true } = {}) {
  const pinia = createMockPinia();
  const store = useUsersStore(pinia);
  if (withProfile) store.profile = profile;
  const result = (name) =>
    vi.spyOn(store, name).mockImplementation(async () => {
      if (ok) store.message = "Berhasil";
      else store.error = "Gagal";
      return ok;
    });
  const spies = {
    changeProfile: result("changeProfile"),
    changePhoto: result("changePhoto"),
    changePassword: result("changePassword"),
  };
  const rendered = await renderWithProviders(ProfilePage, { pinia });
  return { ...rendered, store, ...spies };
}

async function submitProfile(wrapper, name, email) {
  await wrapper.find("#name").setValue(name);
  await wrapper.find("#email").setValue(email);
  await wrapper.get('[data-testid="profile-form"]').trigger("submit");
  await flushPromises();
}

async function submitPassword(wrapper, oldPass, newPass, confirm) {
  await wrapper.find("#password").setValue(oldPass);
  await wrapper.find("#new-password").setValue(newPass);
  await wrapper.find("#confirmation").setValue(confirm);
  await wrapper.get('[data-testid="password-form"]').trigger("submit");
  await flushPromises();
}

describe("ProfilePage", () => {
  it("mengisi form dari profil", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find("#name").element.value).toBe("Budi");
    expect(wrapper.find("#email").element.value).toBe("budi@x.co");
    expect(wrapper.find("img").exists()).toBe(true);
  });

  it("form kosong dan avatar inisial jika profil belum ada, lalu terisi saat profil dimuat", async () => {
    const { wrapper, store } = await setup({ withProfile: false });
    expect(wrapper.find("#name").element.value).toBe("");
    expect(wrapper.find("img").exists()).toBe(false);
    store.profile = profile;
    await flushPromises();
    expect(wrapper.find("#name").element.value).toBe("Budi");
  });

  it("validasi simpan profil", async () => {
    const { wrapper, changeProfile } = await setup();
    await submitProfile(wrapper, "", "budi@x.co");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Nama dan email wajib diisi." }));
    await submitProfile(wrapper, "Budi", "");
    expect(Swal.fire).toHaveBeenCalledTimes(2);
    await submitProfile(wrapper, "Budi", "salah");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Format email tidak valid." }));
    expect(changeProfile).not.toHaveBeenCalled();
  });

  it("simpan profil sukses dan gagal", async () => {
    const ok = await setup();
    await submitProfile(ok.wrapper, " Baru ", "baru@x.co");
    expect(ok.changeProfile).toHaveBeenCalledWith("Baru", "baru@x.co");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil" }));

    const fail = await setup({ ok: false });
    await submitProfile(fail.wrapper, "Baru", "baru@x.co");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal" }));
  });

  it("unggah foto: tanpa file diabaikan, dengan file memanggil store", async () => {
    const { wrapper, changePhoto } = await setup();
    const input = wrapper.get('[data-testid="photo-input"]');
    Object.defineProperty(input.element, "files", { value: [], configurable: true });
    await input.trigger("change");
    expect(changePhoto).not.toHaveBeenCalled();

    const file = new File(["x"], "f.png", { type: "image/png" });
    Object.defineProperty(input.element, "files", { value: [file], configurable: true });
    await input.trigger("change");
    await flushPromises();
    expect(changePhoto).toHaveBeenCalledWith(file);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success" }));
  });

  it.each([
    ["kosong", ["", "baru12", "baru12"], "Semua kolom kata sandi wajib diisi."],
    ["pendek", ["lama", "123", "123"], "Kata sandi baru minimal 6 karakter."],
    ["konfirmasi beda", ["lama", "baru12", "beda12"], "Konfirmasi kata sandi baru tidak sama."],
  ])("validasi ubah sandi: %s", async (_label, values, message) => {
    const { wrapper, changePassword } = await setup();
    await submitPassword(wrapper, ...values);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: message }));
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("ubah sandi sukses mengosongkan form", async () => {
    const { wrapper, changePassword } = await setup();
    await submitPassword(wrapper, "lama", "baru12", "baru12");
    expect(changePassword).toHaveBeenCalledWith("lama", "baru12", "baru12");
    expect(wrapper.find("#password").element.value).toBe("");
    expect(wrapper.find("#new-password").element.value).toBe("");
    expect(wrapper.find("#confirmation").element.value).toBe("");
  });

  it("ubah sandi gagal menampilkan error", async () => {
    const { wrapper } = await setup({ ok: false });
    await submitPassword(wrapper, "lama", "baru12", "baru12");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal" }));
  });
});
