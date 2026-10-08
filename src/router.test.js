import { createMemoryHistory } from "vue-router";
import { describe, expect, it } from "vitest";
import defaultRouter, { authGuard, createAppRouter, routes } from "./router.js";
import { useAuthStore } from "./features/auth/states/authStore.js";
import { createMockPinia } from "./test-utils.js";

function guardWith(token, meta) {
  if (token) localStorage.setItem("accessToken", token);
  createMockPinia();
  useAuthStore();
  return authGuard({ meta });
}

describe("authGuard", () => {
  it("belum login ke halaman terproteksi -> /auth/login", () => {
    expect(guardWith(null, { requiresAuth: true })).toBe("/auth/login");
  });

  it("sudah login ke halaman terproteksi -> diizinkan", () => {
    expect(guardWith("tok", { requiresAuth: true })).toBe(true);
  });

  it("sudah login ke halaman auth -> /", () => {
    expect(guardWith("tok", { guestOnly: true })).toBe("/");
  });

  it("belum login ke halaman auth -> diizinkan", () => {
    expect(guardWith(null, { guestOnly: true })).toBe(true);
  });
});

describe("router", () => {
  it("mendefinisikan rute wajib", () => {
    expect(routes.map((r) => r.path)).toEqual(["/auth", "/", "/:pathMatch(.*)*"]);
    expect(defaultRouter.getRoutes().length).toBeGreaterThan(0);
  });

  it("user belum login diarahkan ke login", async () => {
    createMockPinia();
    const router = createAppRouter(createMemoryHistory());
    await router.push("/users");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("/auth diarahkan ke /auth/login dan /auth/register tersedia", async () => {
    createMockPinia();
    const router = createAppRouter(createMemoryHistory());
    await router.push("/auth");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    await router.push("/auth/register");
    expect(router.currentRoute.value.path).toBe("/auth/register");
  });

  it("user sudah login tidak kembali ke halaman login", async () => {
    localStorage.setItem("accessToken", "tok");
    createMockPinia();
    const router = createAppRouter(createMemoryHistory());
    await router.push("/auth/login");
    expect(router.currentRoute.value.path).toBe("/");
    await router.push("/aucations/3");
    expect(router.currentRoute.value.params.aucationId).toBe("3");
    await router.push("/profile");
    expect(router.currentRoute.value.path).toBe("/profile");
  });

  it("rute tidak dikenal menuju NotFound", async () => {
    createMockPinia();
    const router = createAppRouter(createMemoryHistory());
    await router.push("/tidak/ada");
    expect(router.currentRoute.value.matched[0].path).toBe("/:pathMatch(.*)*");
  });
});
