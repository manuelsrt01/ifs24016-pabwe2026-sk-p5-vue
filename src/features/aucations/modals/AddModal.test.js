import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useAucationsStore } from "../states/aucationsStore.js";
import AddModal from "./AddModal.vue";

async function setup(ok = true) {
  const pinia = createMockPinia();
  const store = useAucationsStore(pinia);
  const addAucation = vi.spyOn(store, "addAucation").mockImplementation(async () => {
    if (ok) store.message = "Lelang dibuat";
    else store.error = "Gagal membuat";
    return ok;
  });
  const result = await renderWithProviders(AddModal, { pinia });
  return { ...result, store, addAucation };
}

async function fill(wrapper, { title = "Laptop", startBid = "5000", closedAt = "2999-01-01T10:00", description = true } = {}) {
  if (description) globalThis.__toast.editors[0].options.events.change();
  await wrapper.find("#add-title").setValue(title);
  await wrapper.find("#add-start-bid").setValue(startBid);
  await wrapper.find("#add-closed-at").setValue(closedAt);
  await wrapper.get('[data-testid="add-form"]').trigger("submit");
  await flushPromises();
}

describe("AddModal", () => {
  it("menampilkan form dan editor markdown", async () => {
    const { wrapper } = await setup();
    expect(wrapper.text()).toContain("Tambah Lelang Baru");
    expect(wrapper.find('[data-testid="markdown-editor"]').exists()).toBe(true);
  });

  it("tombol X dan Batal mengirim close", async () => {
    const { wrapper } = await setup();
    await wrapper.get('[data-testid="modal-close"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it.each([
    ["judul kosong", { title: " " }, "Judul lelang wajib diisi."],
    ["deskripsi kosong", { description: false }, "Deskripsi barang wajib diisi."],
    ["harga awal 0", { startBid: "0" }, "Harga awal harus lebih besar dari 0."],
    ["waktu kosong", { closedAt: "" }, "Waktu penutupan wajib diisi."],
    ["waktu lampau", { closedAt: "2000-01-01T10:00" }, "Waktu penutupan harus di masa depan."],
  ])("validasi: %s", async (_label, values, message) => {
    const { wrapper, addAucation } = await setup();
    await fill(wrapper, values);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: message }));
    expect(addAucation).not.toHaveBeenCalled();
  });

  it("submit sukses mengirim payload dan emit success", async () => {
    const { wrapper, addAucation } = await setup(true);
    await fill(wrapper, { title: " Laptop " });
    expect(addAucation).toHaveBeenCalledWith({
      title: "Laptop",
      description: "# Judul",
      start_bid: 5000,
      closed_at: "2999-01-01 10:00:00",
    });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Lelang dibuat" }));
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("submit gagal menampilkan dialog error tanpa emit success", async () => {
    const { wrapper } = await setup(false);
    await fill(wrapper);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal membuat" }));
    expect(wrapper.emitted("success")).toBeUndefined();
  });
});
