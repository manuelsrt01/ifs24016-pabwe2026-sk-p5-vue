import { flushPromises } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils.js";
import SidebarComponent from "./SidebarComponent.vue";

const linkByText = (wrapper, text) => wrapper.findAll("a").find((link) => link.text() === text);

describe("SidebarComponent", () => {
  it("menampilkan empat menu", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    expect(wrapper.findAll("a").map((link) => link.text())).toEqual([
      "Dashboard Lelang",
      "Lelang Saya",
      "Daftar Pengguna",
      "Profil Saya",
    ]);
  });

  it("menandai Dashboard Lelang aktif di /", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { route: "/" });
    expect(linkByText(wrapper, "Dashboard Lelang").classes()).toContain("bg-indigo-50");
    expect(linkByText(wrapper, "Lelang Saya").classes()).not.toContain("bg-indigo-50");
  });

  it("menandai Lelang Saya aktif di /?tab=mine", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { route: "/?tab=mine" });
    expect(linkByText(wrapper, "Lelang Saya").classes()).toContain("bg-indigo-50");
    expect(linkByText(wrapper, "Dashboard Lelang").classes()).not.toContain("bg-indigo-50");
  });

  it("menandai menu Daftar Pengguna aktif di /users", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { route: "/users" });
    expect(linkByText(wrapper, "Daftar Pengguna").classes()).toContain("bg-indigo-50");
    expect(linkByText(wrapper, "Dashboard Lelang").classes()).not.toContain("bg-indigo-50");
  });

  it("tertutup secara default tanpa overlay", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    expect(wrapper.get('[data-testid="sidebar"]').classes()).toContain("-translate-x-full");
    expect(wrapper.find('[data-testid="sidebar-overlay"]').exists()).toBe(false);
  });

  it("terbuka: overlay tampil dan klik overlay mengirim close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(wrapper.get('[data-testid="sidebar"]').classes()).toContain("translate-x-0");
    await wrapper.get('[data-testid="sidebar-overlay"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("klik menu mengirim close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await linkByText(wrapper, "Profil Saya").trigger("click");
    await flushPromises();
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
