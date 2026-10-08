import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import { useAucationsStore } from "../states/aucationsStore.js";
import DetailPage from "./DetailPage.vue";

vi.mock("../modals/ChangeModal.vue", async () => {
  const { createStub } = await import("../../../test-utils.js");
  return { default: createStub("ChangeModal", ["aucation"]) };
});
vi.mock("../modals/ChangeCoverModal.vue", async () => {
  const { createStub } = await import("../../../test-utils.js");
  return { default: createStub("ChangeCoverModal", ["aucationId"]) };
});
vi.mock("../modals/BidModal.vue", async () => {
  const { createStub } = await import("../../../test-utils.js");
  return { default: createStub("BidModal", ["aucationId", "currentPrice"]) };
});

const base = {
  id: 5, user_id: 1, title: "Oculus Quest 2", cover: "http://x/c.png", description: "Mulus",
  start_bid: 5000000, closed_at: "2999-01-01 10:00:00", author: { name: "Budi" }, bids: [],
};

async function setup({ aucation = base, profile = { id: 1 }, ok = true } = {}) {
  const pinia = createMockPinia();
  const store = useAucationsStore(pinia);
  const users = useUsersStore(pinia);
  users.profile = profile;
  const fetchAucation = vi.spyOn(store, "fetchAucation").mockImplementation(async () => {
    if (ok) store.aucation = aucation;
    else store.error = "Tidak ditemukan";
    return ok;
  });
  vi.spyOn(store, "removeAucation").mockImplementation(async () => {
    store.message = "Dihapus";
    return true;
  });
  vi.spyOn(store, "removeBid").mockImplementation(async () => {
    store.message = "Tawaran dibatalkan";
    return true;
  });
  const result = await renderWithProviders(DetailPage, {
    pinia,
    route: "/aucations/5",
    routes: [
      { path: "/aucations/:aucationId", component: DetailPage },
      { path: "/", component: { render: () => null } },
    ],
  });
  await flushPromises();
  vi.spyOn(result.router, "push");
  return { ...result, store, fetchAucation };
}

const mine = { id: 1, bid: 6000000, created_at: "2024-10-05T08:44:12.000000Z" };
const other = { id: 2, bid: 7000000, created_at: "2024-10-05T09:44:12.000000Z" };

describe("DetailPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("memuat detail berdasarkan parameter rute dan menampilkan informasi", async () => {
    const { wrapper, fetchAucation } = await setup();
    expect(fetchAucation).toHaveBeenCalledWith("5");
    expect(wrapper.get('[data-testid="title"]').text()).toBe("Oculus Quest 2");
    expect(wrapper.get('[data-testid="cover"]').attributes("src")).toBe("http://x/c.png");
    expect(wrapper.get('[data-testid="start-bid"]').text()).toMatch(/Rp\s?5\.000\.000/);
    expect(wrapper.get('[data-testid="highest-bid"]').text()).toMatch(/Rp\s?5\.000\.000/);
    expect(wrapper.get('[data-testid="closed-at"]').text()).toContain("2999");
    expect(wrapper.get('[data-testid="status"]').text()).toBe("Berlangsung");
    expect(wrapper.text()).toContain("Dilelang oleh Budi");
    expect(wrapper.find('[data-testid="markdown-viewer"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="no-bids"]').exists()).toBe(true);
  });

  it("pemilik: ada ubah/cover/hapus, tanpa tombol bid", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="cover-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="bid-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="cancel-bid-button"]').exists()).toBe(false);
  });

  it("peserta lelang aktif: ada tombol bid, tanpa aksi pemilik, tanpa batal bid", async () => {
    const { wrapper } = await setup({ aucation: { ...base, user_id: 2, cover: null }, profile: { id: 1 } });
    expect(wrapper.find('[data-testid="bid-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="cancel-bid-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="no-cover"]').exists()).toBe(true);
  });

  it("profil belum dimuat dianggap bukan pemilik", async () => {
    const { wrapper } = await setup({ profile: null });
    expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="bid-button"]').exists()).toBe(true);
  });

  it("lelang ditutup: tidak bisa bid maupun batal bid", async () => {
    const closedAucation = { ...base, user_id: 2, closed_at: "2000-01-01 10:00:00", my_bid: mine, bids: [mine] };
    const { wrapper } = await setup({ aucation: closedAucation });
    expect(wrapper.get('[data-testid="status"]').text()).toBe("Ditutup");
    expect(wrapper.find('[data-testid="bid-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="cancel-bid-button"]').exists()).toBe(false);
  });

  it("riwayat bid terurut turun, tawaran tertinggi dipakai, dan tawaran saya ditandai", async () => {
    const aucation = { ...base, user_id: 2, bids: [mine, other], my_bid: mine };
    const { wrapper } = await setup({ aucation });
    const items = wrapper.findAll('[data-testid="bid-item"]');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toMatch(/Rp\s?7\.000\.000/);
    expect(items[0].find('[data-testid="my-bid-badge"]').exists()).toBe(false);
    expect(items[1].find('[data-testid="my-bid-badge"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="highest-bid"]').text()).toMatch(/Rp\s?7\.000\.000/);
    expect(wrapper.find('[data-testid="cancel-bid-button"]').exists()).toBe(true);
  });

  it("menampilkan loading dan pesan tidak ditemukan", async () => {
    const found = await setup();
    found.store.isAucation = true;
    await found.wrapper.vm.$nextTick();
    expect(found.wrapper.find('[data-testid="loading"]').exists()).toBe(true);

    const missing = await setup({ ok: false });
    expect(missing.wrapper.find('[data-testid="not-found"]').exists()).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Tidak ditemukan" }));
  });

  it("hapus lelang: konfirmasi lalu kembali ke beranda", async () => {
    const { wrapper, store, router } = await setup();
    await wrapper.get('[data-testid="delete-button"]').trigger("click");
    await flushPromises();
    expect(store.removeAucation).toHaveBeenCalledWith("5");
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("hapus lelang dibatalkan", async () => {
    const { wrapper, store } = await setup();
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await wrapper.get('[data-testid="delete-button"]').trigger("click");
    await flushPromises();
    expect(store.removeAucation).not.toHaveBeenCalled();
  });

  it("batal bid: konfirmasi lalu memuat ulang detail", async () => {
    const aucation = { ...base, user_id: 2, bids: [mine], my_bid: mine };
    const { wrapper, store, fetchAucation } = await setup({ aucation });
    await wrapper.get('[data-testid="cancel-bid-button"]').trigger("click");
    await flushPromises();
    expect(store.removeBid).toHaveBeenCalledWith("5");
    expect(fetchAucation).toHaveBeenCalledTimes(2);
  });

  it("modal ubah: buka, tutup, sukses memuat ulang", async () => {
    const { wrapper, fetchAucation } = await setup();
    await wrapper.get('[data-testid="edit-button"]').trigger("click");
    await wrapper.get('[data-testid="ChangeModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(false);
    await wrapper.get('[data-testid="edit-button"]').trigger("click");
    await wrapper.get('[data-testid="ChangeModal-success"]').trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="ChangeModal"]').exists()).toBe(false);
    expect(fetchAucation).toHaveBeenCalledTimes(2);
  });

  it("modal cover: buka, tutup, sukses memuat ulang", async () => {
    const { wrapper, fetchAucation } = await setup();
    await wrapper.get('[data-testid="cover-button"]').trigger("click");
    await wrapper.get('[data-testid="ChangeCoverModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="ChangeCoverModal"]').exists()).toBe(false);
    await wrapper.get('[data-testid="cover-button"]').trigger("click");
    await wrapper.get('[data-testid="ChangeCoverModal-success"]').trigger("click");
    await flushPromises();
    expect(fetchAucation).toHaveBeenCalledTimes(2);
  });

  it("modal bid: buka, tutup, sukses memuat ulang", async () => {
    const { wrapper, fetchAucation } = await setup({ aucation: { ...base, user_id: 2 } });
    await wrapper.get('[data-testid="bid-button"]').trigger("click");
    await wrapper.get('[data-testid="BidModal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="BidModal"]').exists()).toBe(false);
    await wrapper.get('[data-testid="bid-button"]').trigger("click");
    await wrapper.get('[data-testid="BidModal-success"]').trigger("click");
    await flushPromises();
    expect(fetchAucation).toHaveBeenCalledTimes(2);
  });

  it("status diperbarui oleh timer dan interval dibersihkan saat unmount", async () => {
    const nowSpy = vi.spyOn(Date, "now");
    const start = new Date("2999-01-01T09:00:00").getTime();
    nowSpy.mockReturnValue(start);
    const { wrapper } = await setup();
    expect(wrapper.get('[data-testid="status"]').text()).toBe("Berlangsung");
    nowSpy.mockReturnValue(start + 2 * 3600000);
    vi.advanceTimersByTime(30000);
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[data-testid="status"]').text()).toBe("Ditutup");
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
