import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useUsersStore } from "../states/usersStore.js";
import UsersPage from "./UsersPage.vue";

const people = [
  { id: 1, name: "Budi", email: "budi@x.co", photo: "http://x/b.png", created_at: "2024-10-05T03:18:14.000000Z" },
  { id: 2, name: "Sari", email: "sari@x.co", photo: null, created_at: "2024-10-06T03:18:14.000000Z" },
];

async function setup({ ok = true, users = people } = {}) {
  const pinia = createMockPinia();
  const store = useUsersStore(pinia);
  vi.spyOn(store, "fetchUsers").mockImplementation(async () => {
    if (!ok) store.error = "Gagal memuat";
    else store.users = users;
    return ok;
  });
  const result = await renderWithProviders(UsersPage, { pinia });
  await flushPromises();
  return { ...result, store };
}

describe("UsersPage", () => {
  it("memuat dan menampilkan daftar pengguna", async () => {
    const { wrapper, store } = await setup();
    expect(store.fetchUsers).toHaveBeenCalledOnce();
    expect(wrapper.findAll('[data-testid="user-card"]')).toHaveLength(2);
    expect(wrapper.text()).toContain("budi@x.co");
  });

  it("menampilkan keadaan kosong", async () => {
    const { wrapper } = await setup({ users: [] });
    expect(wrapper.find('[data-testid="users-empty"]').exists()).toBe(true);
  });

  it("menampilkan loading", async () => {
    const { wrapper, store } = await setup();
    store.isUsersLoading = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(true);
  });

  it("menampilkan dialog error jika gagal memuat", async () => {
    await setup({ ok: false });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal memuat" }));
  });

  it("memilih pengguna menampilkan panel detail", async () => {
    const { wrapper, store } = await setup();
    expect(wrapper.find('[data-testid="selected-user"]').exists()).toBe(false);
    await wrapper.findAll('[data-testid="user-card"]')[1].trigger("click");
    expect(store.user).toEqual(people[1]);
    const panel = wrapper.get('[data-testid="selected-user"]');
    expect(panel.text()).toContain("Sari");
    expect(panel.text()).toContain("2024");
  });
});
