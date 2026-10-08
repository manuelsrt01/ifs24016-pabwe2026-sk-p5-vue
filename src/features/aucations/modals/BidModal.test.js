import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useAucationsStore } from "../states/aucationsStore.js";
import BidModal from "./BidModal.vue";

async function setup(ok = true) {
  const pinia = createMockPinia();
  const store = useAucationsStore(pinia);
  const addBid = vi.spyOn(store, "addBid").mockImplementation(async () => {
    if (ok) store.message = "Tawaran terkirim";
    else store.error = "Gagal menawar";
    return ok;
  });
  const result = await renderWithProviders(BidModal, { pinia, props: { aucationId: 9, currentPrice: 100000 } });
  return { ...result, addBid };
}

async function submit(wrapper, value) {
  await wrapper.find("#bid").setValue(value);
  await wrapper.get('[data-testid="bid-form"]').trigger("submit");
  await flushPromises();
}

describe("BidModal", () => {
  it("menampilkan tawaran tertinggi saat ini", async () => {
    const { wrapper } = await setup();
    expect(wrapper.get('[data-testid="current-price"]').text()).toMatch(/Rp\s?100\.000/);
  });

  it("tombol X dan Batal mengirim close", async () => {
    const { wrapper } = await setup();
    await wrapper.get('[data-testid="modal-close"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it.each([
    ["kosong", ""],
    ["lebih rendah", "50000"],
    ["sama dengan tawaran tertinggi", "100000"],
  ])("menolak nominal %s", async (_label, value) => {
    const { wrapper, addBid } = await setup();
    await submit(wrapper, value);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "warning", text: expect.stringMatching(/lebih tinggi dari Rp\s?100\.000/) }),
    );
    expect(addBid).not.toHaveBeenCalled();
  });

  it("nominal lebih tinggi berhasil dikirim", async () => {
    const { wrapper, addBid } = await setup(true);
    await submit(wrapper, "100001");
    expect(addBid).toHaveBeenCalledWith(9, 100001);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Tawaran terkirim" }));
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("gagal mengirim menampilkan dialog error", async () => {
    const { wrapper } = await setup(false);
    await submit(wrapper, "200000");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal menawar" }));
    expect(wrapper.emitted("success")).toBeUndefined();
  });
});
