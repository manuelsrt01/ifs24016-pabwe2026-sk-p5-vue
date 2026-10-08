import { defineComponent, h } from "vue";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderRoutes } from "../../../test-utils.js";
import { useAuthStore } from "../../auth/states/authStore.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import AucationLayout from "./AucationLayout.vue";

vi.mock("../components/NavbarComponent.vue", async () => {
  const { createStub } = await import("../../../test-utils.js");
  return { default: createStub("NavbarComponent", [], ["toggle-sidebar"]) };
});
vi.mock("../components/SidebarComponent.vue", async () => {
  const { createStub } = await import("../../../test-utils.js");
  return { default: createStub("SidebarComponent", ["open"], ["close"]) };
});

const Child = defineComponent({ render: () => h("p", "isi dashboard") });
const Login = defineComponent({ render: () => h("p", "halaman login") });
const routes = [
  { path: "/", component: AucationLayout, children: [{ path: "", component: Child }] },
  { path: "/auth/login", component: Login },
];

async function setup(profileOk) {
  const pinia = createMockPinia();
  const users = useUsersStore(pinia);
  const auth = useAuthStore(pinia);
  vi.spyOn(users, "fetchProfile").mockResolvedValue(profileOk);
  vi.spyOn(auth, "logout");
  const result = await renderRoutes(routes, "/", pinia);
  await flushPromises();
  return { ...result, users, auth };
}

describe("AucationLayout", () => {
  it("memuat profil dan menampilkan navbar, sidebar, serta konten", async () => {
    const { wrapper, users, auth } = await setup(true);
    expect(users.fetchProfile).toHaveBeenCalledOnce();
    expect(auth.logout).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="NavbarComponent"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="SidebarComponent"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("isi dashboard");
  });

  it("membuka dan menutup sidebar lewat event", async () => {
    const { wrapper } = await setup(true);
    const sidebar = wrapper.findComponent({ name: "SidebarComponent" });
    expect(sidebar.props("open")).toBe(false);
    await wrapper.get('[data-testid="NavbarComponent-toggle-sidebar"]').trigger("click");
    expect(sidebar.props("open")).toBe(true);
    await wrapper.get('[data-testid="SidebarComponent-close"]').trigger("click");
    expect(sidebar.props("open")).toBe(false);
  });

  it("logout otomatis dan kembali ke login jika profil gagal dimuat", async () => {
    const { wrapper, auth, router } = await setup(false);
    expect(auth.logout).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.text()).toContain("halaman login");
  });
});
