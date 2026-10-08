import Swal from "sweetalert2";

const COLOR = "#4f46e5";

const fire = (icon, title, text) =>
  Swal.fire({ icon, title, text, confirmButtonColor: COLOR });

export const showSuccessDialog = (text) => fire("success", "Berhasil", text);
export const showErrorDialog = (text) => fire("error", "Gagal", text);
export const showWarningDialog = (text) => fire("warning", "Perhatian", text);

export async function showConfirmDialog(title, text) {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: COLOR,
  });
  return result.isConfirmed;
}

export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

// "2024-10-05 22:00:00" (format API) -> Date
export const parseDate = (value) => new Date(String(value).replace(" ", "T"));

export function formatDate(value) {
  const date = parseDate(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export const isClosed = (closedAt, now) => parseDate(closedAt).getTime() <= now;

export function formatCountdown(closedAt, now) {
  const diff = parseDate(closedAt).getTime() - now;
  if (diff <= 0) return "Ditutup";
  const minutes = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} hari ${hours} jam lagi`;
  if (hours > 0) return `${hours} jam ${minutes} menit lagi`;
  return `${minutes} menit lagi`;
}

// Pada daftar lelang, `bids` bisa berupa array id (angka); pada detail berupa objek { id, bid }.
export function getHighestBid(bids) {
  return Math.max(
    0,
    ...bids.filter((item) => typeof item === "object").map((item) => Number(item.bid)),
  );
}

export const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

// "2026-12-31T23:59" (input datetime-local) -> "2026-12-31 23:59:00" (format API)
export const toApiDateTime = (value) => `${value.replace("T", " ")}:00`;

// "2026-12-31 23:59:00" (format API) -> "2026-12-31T23:59" (input datetime-local)
export const toInputDateTime = (value) => value.replace(" ", "T").slice(0, 16);

export function validateAucationForm({ title, description, startBid, closedAt }, now) {
  if (!title.trim()) return "Judul lelang wajib diisi.";
  if (!description.trim()) return "Deskripsi barang wajib diisi.";
  if (!(Number(startBid) > 0)) return "Harga awal harus lebih besar dari 0.";
  if (!closedAt) return "Waktu penutupan wajib diisi.";
  if (new Date(closedAt).getTime() <= now) return "Waktu penutupan harus di masa depan.";
  return "";
}

// Foto profil dari /users/me berupa path relatif ("img/profile/3.png")
export function resolveAsset(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, "")}`;
}

export async function runWithDialog(action, source, onSuccess) {
  if (await action()) {
    await showSuccessDialog(source.message);
    await onSuccess();
    return true;
  }
  await showErrorDialog(source.error);
  return false;
}

export async function confirmAndRun(title, text, action, source, onSuccess) {
  if (!(await showConfirmDialog(title, text))) return false;
  return runWithDialog(action, source, onSuccess);
}
