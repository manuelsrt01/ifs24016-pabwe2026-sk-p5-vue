import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useAuthStore } from "../../auth/states/authStore.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import NavbarComponent from "./NavbarComponent.vue";

async function setup(profile) {
  const pinia = createMockPinia();
  const users = useUsersStore(pinia);
  users.profile = profile;
  const auth = useAuthStore(pinia);
  vi.spyOn(auth, "logout");
  const result = await renderWithProviders(NavbarComponent, { pinia });
  vi.spyOn(result.router, "push");
  return { ...result, auth };
}

describe("NavbarComponent", () => {
  it("menampilkan nama, email, dan foto profil", async () => {
    const { wrapper } = await setup({ name: "Budi", email: "budi@x.co", photo: "img/profile/1.png" });
    expect(wrapper.get('[data-testid="user-name"]').text()).toBe("Budi");
    expect(wrapper.get('[data-testid="user-email"]').text()).toBe("budi@x.co");
    expect(wrapper.find("img").attributes("src")).toBe("https://open-api.delcom.org/img/profile/1.png");
  });

  it("menampilkan inisial jika foto kosong", async () => {
    const { wrapper } = await setup({ name: "Sari", email: "s@x.co", photo: null });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.get('[data-testid="avatar-initial"]').text()).toBe("S");
  });

  it("menampilkan fallback Pengguna jika profil belum dimuat", async () => {
    const { wrapper } = await setup(null);
    expect(wrapper.get('[data-testid="user-name"]').text()).toBe("Pengguna");
    expect(wrapper.get('[data-testid="user-email"]').text()).toBe("");
    expect(wrapper.get('[data-testid="avatar-initial"]').text()).toBe("P");
  });

  it("tombol menu mengirim event toggle-sidebar", async () => {
    const { wrapper } = await setup(null);
    await wrapper.get('[data-testid="menu-button"]').trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("menu cepat mengarah ke Lelang Saya", async () => {
    const { wrapper } = await setup(null);
    expect(wrapper.get('[data-testid="quick-mine"]').attributes("href")).toBe("/?tab=mine");
  });

  it("logout setelah konfirmasi", async () => {
    const { wrapper, auth, router } = await setup(null);
    await wrapper.get('[data-testid="logout-button"]').trigger("click");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: "Keluar dari akun?" }));
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledWith("/auth/login");
  });

  it("logout dibatalkan", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    const { wrapper, auth, router } = await setup(null);
    await wrapper.get('[data-testid="logout-button"]').trigger("click");
    await flushPromises();
    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });
});
