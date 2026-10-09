import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import { createAppRouter } from "./router.js";
import { createMockPinia } from "./test-utils.js";

function mockApi() {
  globalThis.fetch = vi.fn(async (url) => {
    const path = new URL(url).pathname;
    const data = path.endsWith("/users/me")
      ? { user: { id: 1, name: "Budi", email: "budi@x.co", photo: null } }
      : {
          aucations: [
            {
              id: 1,
              user_id: 2,
              title: "Laptop Gaming",
              cover: null,
              description: "Spek tinggi",
              start_bid: 5000000,
              closed_at: "2999-01-01 10:00:00",
              author: { name: "Sari" },
              bids: [],
            },
          ],
        };
    return { json: async () => ({ status: "success", message: "ok", data }) };
  });
}

async function render(path) {
  const pinia = createMockPinia();
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  const wrapper = mount(App, { global: { plugins: [pinia, router] } });
  await flushPromises();
  return { wrapper, router };
}

describe("App", () => {
  it("menampilkan kerangka sementara sebelum navigasi awal selesai", async () => {
    const pinia = createMockPinia();
    const router = createAppRouter(createMemoryHistory());
    const wrapper = mount(App, { global: { plugins: [pinia, router] } });
    expect(wrapper.find('[data-testid="app-loading"]').exists()).toBe(true);
    await router.isReady();
    await flushPromises();
    expect(wrapper.find('[data-testid="app-loading"]').exists()).toBe(false);
  });

  it("user belum login melihat halaman login", async () => {
    const { wrapper, router } = await render("/");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.text()).toContain("Masuk Akun");
  });

  it("user login melihat dashboard lelang lengkap dengan navbar dan sidebar", async () => {
    localStorage.setItem("accessToken", "tok");
    mockApi();
    const { wrapper } = await render("/");
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("Laptop Gaming");
    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("Daftar Pengguna");
  });

  it("rute tidak dikenal menampilkan 404", async () => {
    const { wrapper } = await render("/tidak/ada");
    expect(wrapper.text()).toContain("404");
  });
});
