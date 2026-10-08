import { describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  confirmAndRun,
  formatCountdown,
  formatDate,
  formatRupiah,
  getHighestBid,
  isClosed,
  isValidEmail,
  resolveAsset,
  runWithDialog,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
  toApiDateTime,
  toInputDateTime,
  validateAucationForm,
} from "./toolsHelper.js";

describe("dialog SweetAlert2", () => {
  it("showSuccessDialog / showErrorDialog / showWarningDialog", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("gagal");
    await showWarningDialog("hati-hati");
    expect(Swal.fire).toHaveBeenNthCalledWith(1, expect.objectContaining({ icon: "success", text: "ok" }));
    expect(Swal.fire).toHaveBeenNthCalledWith(2, expect.objectContaining({ icon: "error", text: "gagal" }));
    expect(Swal.fire).toHaveBeenNthCalledWith(3, expect.objectContaining({ icon: "warning", text: "hati-hati" }));
  });

  it("showConfirmDialog mengembalikan isConfirmed", async () => {
    expect(await showConfirmDialog("Judul", "Teks")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "question", title: "Judul", showCancelButton: true }),
    );
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("Judul", "Teks")).toBe(false);
  });
});

describe("format & util", () => {
  it("formatRupiah", () => {
    expect(formatRupiah(10000)).toMatch(/^Rp\s?10\.000$/);
    expect(formatRupiah("2500000")).toMatch(/^Rp\s?2\.500\.000$/);
  });

  it("formatDate valid dan tidak valid", () => {
    expect(formatDate("2024-10-05 22:00:00")).toContain("2024");
    expect(formatDate("2024-10-05T09:04:49.000000Z")).toContain("2024");
    expect(formatDate(undefined)).toBe("-");
  });

  it("isClosed", () => {
    expect(isClosed("2000-01-01 00:00:00", Date.now())).toBe(true);
    expect(isClosed("2999-01-01 00:00:00", Date.now())).toBe(false);
  });

  it("formatCountdown untuk semua kondisi", () => {
    const now = new Date("2026-01-01T00:00:00").getTime();
    expect(formatCountdown("2025-12-31 23:00:00", now)).toBe("Ditutup");
    expect(formatCountdown("2026-01-01 00:00:00", now)).toBe("Ditutup");
    expect(formatCountdown("2026-01-01 00:30:00", now)).toBe("30 menit lagi");
    expect(formatCountdown("2026-01-01 02:15:00", now)).toBe("2 jam 15 menit lagi");
    expect(formatCountdown("2026-01-03 05:00:00", now)).toBe("2 hari 5 jam lagi");
  });

  it("getHighestBid mendukung array id maupun objek bid", () => {
    expect(getHighestBid([])).toBe(0);
    expect(getHighestBid([1, 2])).toBe(0);
    expect(getHighestBid([{ id: 1, bid: 100 }, { id: 2, bid: 300 }, 5])).toBe(300);
  });

  it("isValidEmail", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("abc")).toBe(false);
  });

  it("konversi datetime API <-> input", () => {
    expect(toApiDateTime("2026-12-31T23:59")).toBe("2026-12-31 23:59:00");
    expect(toInputDateTime("2026-12-31 23:59:00")).toBe("2026-12-31T23:59");
  });

  it("resolveAsset", () => {
    expect(resolveAsset("")).toBe("");
    expect(resolveAsset(null)).toBe("");
    expect(resolveAsset("http://x.test/a.png")).toBe("http://x.test/a.png");
    expect(resolveAsset("img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
    expect(resolveAsset("/img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
  });
});

describe("validateAucationForm", () => {
  const now = new Date("2026-01-01T00:00:00").getTime();
  const valid = { title: "A", description: "B", startBid: "1000", closedAt: "2026-02-01T10:00" };

  it("mengembalikan pesan untuk tiap kesalahan", () => {
    expect(validateAucationForm({ ...valid, title: " " }, now)).toBe("Judul lelang wajib diisi.");
    expect(validateAucationForm({ ...valid, description: "" }, now)).toBe("Deskripsi barang wajib diisi.");
    expect(validateAucationForm({ ...valid, startBid: "0" }, now)).toBe("Harga awal harus lebih besar dari 0.");
    expect(validateAucationForm({ ...valid, startBid: "" }, now)).toBe("Harga awal harus lebih besar dari 0.");
    expect(validateAucationForm({ ...valid, closedAt: "" }, now)).toBe("Waktu penutupan wajib diisi.");
    expect(validateAucationForm({ ...valid, closedAt: "2025-01-01T10:00" }, now)).toBe(
      "Waktu penutupan harus di masa depan.",
    );
  });

  it("mengembalikan string kosong jika valid", () => {
    expect(validateAucationForm(valid, now)).toBe("");
  });
});

describe("runWithDialog & confirmAndRun", () => {
  it("sukses: tampil dialog sukses lalu onSuccess", async () => {
    const onSuccess = vi.fn();
    const result = await runWithDialog(async () => true, { message: "Berhasil!", error: "" }, onSuccess);
    expect(result).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Berhasil!" }));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("gagal: tampil dialog error tanpa onSuccess", async () => {
    const onSuccess = vi.fn();
    const result = await runWithDialog(async () => false, { message: "", error: "Ups" }, onSuccess);
    expect(result).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Ups" }));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("confirmAndRun dibatalkan user", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    const action = vi.fn();
    expect(await confirmAndRun("T", "x", action, {}, vi.fn())).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it("confirmAndRun dikonfirmasi lalu menjalankan action", async () => {
    const action = vi.fn().mockResolvedValue(true);
    expect(await confirmAndRun("T", "x", action, { message: "m" }, vi.fn())).toBe(true);
    expect(action).toHaveBeenCalledOnce();
  });
});
