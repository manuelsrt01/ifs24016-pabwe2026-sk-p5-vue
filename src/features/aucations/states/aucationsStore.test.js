import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia } from "../../../test-utils.js";
import * as api from "../api/aucationApi.js";
import { useAucationsStore } from "./aucationsStore.js";

vi.mock("../api/aucationApi.js", () => ({
  getAucations: vi.fn(),
  getAucation: vi.fn(),
  postAucation: vi.fn(),
  putAucation: vi.fn(),
  postCover: vi.fn(),
  deleteAucation: vi.fn(),
  postBid: vi.fn(),
  deleteBid: vi.fn(),
  deleteAllAucations: vi.fn(),
}));

const response = {
  message: "ok",
  data: { aucations: [{ id: 1 }], aucation: { id: 2 } },
};

// [action, args, fungsi API, flag loading, flag selesai]
const cases = [
  ["fetchAucations", [{ is_me: 1 }], "getAucations", "isAucation", "isAucationLoaded"],
  ["fetchAucation", [2], "getAucation", "isAucation", "isAucationLoaded"],
  ["addAucation", [{ title: "A" }], "postAucation", "isAucationAdd", "isAucationAdded"],
  ["changeAucation", [2, { title: "B" }], "putAucation", "isAucationChange", "isAucationChanged"],
  ["changeCover", [2, "file"], "postCover", "isAucationChangeCover", "isAucationChangedCover"],
  ["removeAucation", [2], "deleteAucation", "isAucationDelete", "isAucationDeleted"],
  ["addBid", [2, 5000], "postBid", "isBidAdd", "isBidAdded"],
  ["removeBid", [2], "deleteBid", "isBidDelete", "isBidDeleted"],
  ["removeAllAucations", [], "deleteAllAucations", "isAucationDeleteAll", "isAucationDeletedAll"],
];

describe("aucationsStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("state awal", () => {
    const store = useAucationsStore();
    expect(store.aucations).toEqual([]);
    expect(store.aucation).toBeNull();
    expect(store.isAucation).toBe(false);
  });

  it.each(cases)("%s sukses: flag, pesan, dan argumen API", async (action, args, apiName, loading, done) => {
    api[apiName].mockResolvedValue(response);
    const store = useAucationsStore();
    const pending = store[action](...args);
    expect(store[loading]).toBe(true);
    expect(await pending).toBe(true);
    expect(api[apiName]).toHaveBeenCalledWith(...args);
    expect(store[loading]).toBe(false);
    expect(store[done]).toBe(true);
    expect(store.message).toBe("ok");
    expect(store.error).toBe("");
  });

  it.each(cases)("%s gagal: menyimpan pesan error", async (action, args, apiName, loading, done) => {
    api[apiName].mockRejectedValue(new Error("gagal"));
    const store = useAucationsStore();
    expect(await store[action](...args)).toBe(false);
    expect(store.error).toBe("gagal");
    expect(store[loading]).toBe(false);
    expect(store[done]).toBe(false);
  });

  it("fetchAucations mengisi daftar lelang", async () => {
    api.getAucations.mockResolvedValue(response);
    const store = useAucationsStore();
    await store.fetchAucations({});
    expect(store.aucations).toEqual([{ id: 1 }]);
  });

  it("fetchAucation mengisi lelang aktif", async () => {
    api.getAucation.mockResolvedValue(response);
    const store = useAucationsStore();
    await store.fetchAucation(2);
    expect(store.aucation).toEqual({ id: 2 });
  });
});
