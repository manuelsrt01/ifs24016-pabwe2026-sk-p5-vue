import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import { useAucationsStore } from "../states/aucationsStore.js";
import HomePage from "./HomePage.vue";

vi.mock("../modals/AddModal.vue", async () => {
  const { createStub } = await import("../../../test-utils.js");
  return { default: createStub("AddModal") };
});

const open = {
  id: 1, user_id: 1, title: "Laptop Gaming", cover: "http://x/c.png", description: "Spek tinggi",
  start_bid: 5000000, closed_at: "2999-01-01 10:00:00", author: { name: "Budi" }, bids: [],
};
const closed = {
  id: 2, user_id: 2, title: "Kamera", cover: null, description: "Mirrorless bekas",
  start_bid: 3000000, closed_at: "2000-01-01 10:00:00", author: { name: "Sari" }, bids: [7],
};
const withBid = {
  id: 3, user_id: 2, title: "Sepeda", cover: null, description: "Sepeda lipat",
  start_bid: 1000000, closed_at: "2999-01-01 10:00:00", author: { name: "Sari" }, bids: [{ id: 1, bid: 1500000 }],
};

async function setup({ route = "/", profile = { id: 1 }, ok = true, list = [open, closed, withBid] } = {}) {
  const pinia = createMockPinia();
  const store = useAucationsStore(pinia);
  const users = useUsersStore(pinia);
  users.profile = profile;
  const fetchAucations = vi.spyOn(store, "fetchAucations").mockImplementation(async () => {
    if (ok) store.aucations = list;
    else store.error = "Gagal memuat lelang";
    return ok;
  });
  vi.spyOn(store, "removeAucation").mockImplementation(async () => {
    store.message = "Dihapus";
    return true;
  });
  vi.spyOn(store, "removeAllAucations").mockImplementation(async () => {
    store.message = "Semua dihapus";
    return true;
  });
  const result = await renderWithProviders(HomePage, {
    pinia,
    route,
    routes: [{ path: "/", component: HomePage }],
  });
  await flushPromises();
  return { ...result, store, users, fetchAucations };
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("memuat semua lelang dan menampilkan kartu informatif", async () => {
    const { wrapper, fetchAucations } = await setup();
    expect(fetchAucations).toHaveBeenCalledWith({});
    const cards = wrapper.findAll('[data-testid="aucation-card"]');
    expect(cards).toHaveLength(3);
    expect(cards[0].text()).toContain("Laptop Gaming");
    expect(cards[0].text()).toContain("oleh Budi");
    expect(cards[0].text()).toMatch(/Rp\s?5\.000\.000/);
    expect(cards[0].find("img").attributes("src")).toBe("http://x/c.png");
    expect(cards[0].get('[data-testid="status"]').text()).toContain("hari");
    expect(cards[0].get('[data-testid="bid-count"]').text()).toBe("0 tawaran");
    expect(cards[0].get('[data-testid="detail-link"]').attributes("href")).toBe("/aucations/1");
    expect(cards[1].find('[data-testid="no-cover"]').exists()).toBe(true);
    expect(cards[1].get('[data-testid="status"]').text()).toContain("Ditutup");
    expect(cards[1].get('[data-testid="bid-count"]').text()).toBe("1 tawaran");
    expect(cards[2].get('[data-testid="highest"]').text()).toMatch(/Rp\s?1\.500\.000/);
  });

  it("tab Lelang Saya memakai filter is_me dan menampilkan tombol hapus semua", async () => {
    const { wrapper, fetchAucations } = await setup({ route: "/?tab=mine" });
    expect(fetchAucations).toHaveBeenCalledWith({ is_me: 1 });
    expect(wrapper.find('[data-testid="delete-all-button"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="tab-mine"]').classes()).toContain("bg-indigo-600");
  });

  it("tab tidak dikenal kembali ke Semua Lelang tanpa tombol hapus semua", async () => {
    const { wrapper, fetchAucations } = await setup({ route: "/?tab=xyz" });
    expect(fetchAucations).toHaveBeenCalledWith({});
    expect(wrapper.find('[data-testid="delete-all-button"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="tab-all"]').classes()).toContain("bg-indigo-600");
  });

  it.each([
    ["open", { is_closed: 0 }],
    ["closed", { is_closed: 1 }],
  ])("klik tab %s memuat ulang dengan filter yang benar", async (key, query) => {
    const { wrapper, fetchAucations, router } = await setup();
    await wrapper.get(`[data-testid="tab-${key}"]`).trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBe(key);
    expect(fetchAucations).toHaveBeenLastCalledWith(query);
  });

  it("live search berdasarkan judul dan deskripsi", async () => {
    const { wrapper } = await setup();
    const input = wrapper.get('[data-testid="search-input"]');
    await input.setValue("kamera");
    expect(wrapper.findAll('[data-testid="aucation-card"]')).toHaveLength(1);
    await input.setValue("lipat");
    expect(wrapper.get('[data-testid="aucation-card"]').text()).toContain("Sepeda");
    await input.setValue("tidak-ada");
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true);
  });

  it("menampilkan loading", async () => {
    const { wrapper, store } = await setup();
    store.isAucation = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true);
  });

  it("menampilkan dialog error jika gagal memuat", async () => {
    await setup({ ok: false });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal memuat lelang" }));
  });

  it("tombol hapus hanya muncul pada lelang milik sendiri", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find('[data-testid="delete-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-2"]').exists()).toBe(false);
  });

  it("tidak ada tombol hapus jika profil belum dimuat", async () => {
    const { wrapper } = await setup({ profile: null });
    expect(wrapper.find('[data-testid="delete-1"]').exists()).toBe(false);
  });

  it("hapus lelang: dikonfirmasi lalu memuat ulang", async () => {
    const { wrapper, store, fetchAucations } = await setup();
    await wrapper.get('[data-testid="delete-1"]').trigger("click");
    await flushPromises();
    expect(store.removeAucation).toHaveBeenCalledWith(1);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Dihapus" }));
    expect(fetchAucations).toHaveBeenCalledTimes(2);
  });

  it("hapus lelang dibatalkan", async () => {
    const { wrapper, store } = await setup();
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await wrapper.get('[data-testid="delete-1"]').trigger("click");
    await flushPromises();
    expect(store.removeAucation).not.toHaveBeenCalled();
  });

  it("hapus semua lelang saya", async () => {
    const { wrapper, store, fetchAucations } = await setup({ route: "/?tab=mine" });
    await wrapper.get('[data-testid="delete-all-button"]').trigger("click");
    await flushPromises();
    expect(store.removeAllAucations).toHaveBeenCalledOnce();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Semua dihapus" }));
    expect(fetchAucations).toHaveBeenCalledTimes(2);
  });

  it("modal tambah: buka, tutup, lalu sukses memuat ulang", async () => {
    const { wrapper, fetchAucations } = await setup();
    expect(wrapper.find('[data-testid="AddModal"]').exists()).toBe(false);
    await wrapper.get('[data-testid="add-button"]').trigger("click");
    await wrapper.get('[data-testid="AddModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="AddModal"]').exists()).toBe(false);

    await wrapper.get('[data-testid="add-button"]').trigger("click");
    await wrapper.get('[data-testid="AddModal-success"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="AddModal"]').exists()).toBe(false);
    expect(fetchAucations).toHaveBeenCalledTimes(2);
  });

  it("countdown diperbarui tiap 30 detik dan interval dibersihkan saat unmount", async () => {
    const soon = { ...open, closed_at: "2999-01-01 10:00:00" };
    const nowSpy = vi.spyOn(Date, "now");
    const base = new Date("2999-01-01T09:59:30").getTime();
    nowSpy.mockReturnValue(base);
    const { wrapper } = await setup({ list: [soon] });
    expect(wrapper.get('[data-testid="status"]').text()).toContain("0 menit lagi");
    nowSpy.mockReturnValue(base + 60000);
    vi.advanceTimersByTime(30000);
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[data-testid="status"]').text()).toContain("Ditutup");
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
