import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useAucationsStore } from "../states/aucationsStore.js";
import ChangeModal from "./ChangeModal.vue";

const aucation = {
  id: 7,
  title: "Sepeda",
  description: "Sepeda lipat",
  start_bid: 1500000,
  closed_at: "2999-01-01 10:00:00",
};

async function setup(ok = true) {
  const pinia = createMockPinia();
  const store = useAucationsStore(pinia);
  const changeAucation = vi.spyOn(store, "changeAucation").mockImplementation(async () => {
    if (ok) store.message = "Lelang diubah";
    else store.error = "Gagal mengubah";
    return ok;
  });
  const result = await renderWithProviders(ChangeModal, { pinia, props: { aucation } });
  return { ...result, store, changeAucation };
}

describe("ChangeModal", () => {
  it("mengisi form dari data lelang", async () => {
    const { wrapper } = await setup();
    expect(wrapper.find("#change-title").element.value).toBe("Sepeda");
    expect(wrapper.find("#change-start-bid").element.value).toBe("1500000");
    expect(wrapper.find("#change-closed-at").element.value).toBe("2999-01-01T10:00");
    expect(globalThis.__toast.editors[0].options.initialValue).toBe("Sepeda lipat");
  });

  it("tombol X dan Batal mengirim close", async () => {
    const { wrapper } = await setup();
    await wrapper.get('[data-testid="modal-close"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("validasi: judul kosong", async () => {
    const { wrapper, changeAucation } = await setup();
    await wrapper.find("#change-title").setValue("");
    await wrapper.get('[data-testid="change-form"]').trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning", text: "Judul lelang wajib diisi." }));
    expect(changeAucation).not.toHaveBeenCalled();
  });

  it("submit sukses mengirim payload dan emit success", async () => {
    const { wrapper, changeAucation } = await setup(true);
    globalThis.__toast.editors[0].options.events.change();
    await wrapper.find("#change-title").setValue("Sepeda Baru");
    await wrapper.find("#change-start-bid").setValue("2000000");
    await wrapper.find("#change-closed-at").setValue("2999-02-02T08:30");
    await wrapper.get('[data-testid="change-form"]').trigger("submit");
    await flushPromises();
    expect(changeAucation).toHaveBeenCalledWith(7, {
      title: "Sepeda Baru",
      description: "# Judul",
      start_bid: 2000000,
      closed_at: "2999-02-02 08:30:00",
    });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Lelang diubah" }));
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("submit gagal menampilkan dialog error", async () => {
    const { wrapper } = await setup(false);
    await wrapper.get('[data-testid="change-form"]').trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal mengubah" }));
    expect(wrapper.emitted("success")).toBeUndefined();
  });
});
