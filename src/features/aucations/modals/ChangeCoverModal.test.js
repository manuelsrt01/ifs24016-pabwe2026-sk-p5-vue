import { flushPromises } from "@vue/test-utils";
import Swal from "sweetalert2";
import { describe, expect, it, vi } from "vitest";
import { createMockPinia, renderWithProviders } from "../../../test-utils.js";
import { useAucationsStore } from "../states/aucationsStore.js";
import ChangeCoverModal from "./ChangeCoverModal.vue";

async function setup(ok = true) {
  const pinia = createMockPinia();
  const store = useAucationsStore(pinia);
  const changeCover = vi.spyOn(store, "changeCover").mockImplementation(async () => {
    if (ok) store.message = "Cover diubah";
    else store.error = "Gagal unggah";
    return ok;
  });
  const result = await renderWithProviders(ChangeCoverModal, { pinia, props: { aucationId: 3 } });
  return { ...result, changeCover };
}

async function pick(wrapper, files) {
  const input = wrapper.get('[data-testid="cover-input"]');
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
  await flushPromises();
}

const image = () => new File(["x"], "cover.png", { type: "image/png" });

describe("ChangeCoverModal", () => {
  it("tombol X dan Batal mengirim close", async () => {
    const { wrapper } = await setup();
    await wrapper.get('[data-testid="modal-close"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });

  it("tanpa file yang dipilih, submit memberi peringatan", async () => {
    const { wrapper, changeCover } = await setup();
    await wrapper.get('[data-testid="cover-form"]').trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "Pilih gambar cover terlebih dahulu." }));
    expect(changeCover).not.toHaveBeenCalled();
  });

  it("memilih file kosong diabaikan", async () => {
    const { wrapper } = await setup();
    await pick(wrapper, []);
    expect(wrapper.find('[data-testid="cover-preview"]').exists()).toBe(false);
  });

  it("menolak file non-gambar", async () => {
    const { wrapper } = await setup();
    await pick(wrapper, [new File(["x"], "doc.pdf", { type: "application/pdf" })]);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ text: "File harus berupa gambar." }));
    expect(wrapper.find('[data-testid="cover-preview"]').exists()).toBe(false);
  });

  it("menampilkan pratinjau gambar dan mengunggah dengan sukses", async () => {
    const { wrapper, changeCover } = await setup(true);
    const file = image();
    await pick(wrapper, [file]);
    expect(wrapper.get('[data-testid="cover-preview"]').attributes("src")).toBe("blob:preview");
    await wrapper.get('[data-testid="cover-form"]').trigger("submit");
    await flushPromises();
    expect(changeCover).toHaveBeenCalledWith(3, file);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Cover diubah" }));
    expect(wrapper.emitted("success")).toHaveLength(1);
  });

  it("unggah gagal menampilkan dialog error", async () => {
    const { wrapper } = await setup(false);
    await pick(wrapper, [image()]);
    await wrapper.get('[data-testid="cover-form"]').trigger("submit");
    await flushPromises();
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal unggah" }));
  });

  it("revoke URL pratinjau saat unmount hanya jika ada pratinjau", async () => {
    const withoutPreview = await setup();
    withoutPreview.wrapper.unmount();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    const withPreview = await setup();
    await pick(withPreview.wrapper, [image()]);
    withPreview.wrapper.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
});
