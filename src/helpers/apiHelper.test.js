import { describe, expect, it, vi } from "vitest";
import {
  apiDelete,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper.js";
import { mockFetch } from "../test-utils.js";

const ok = { status: "success", message: "ok", data: { a: 1 } };

describe("apiHelper - token", () => {
  it("menyimpan, membaca, dan menghapus token di localStorage", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(localStorage.getItem("accessToken")).toBe("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiHelper - request", () => {
  it("GET berhasil tanpa token dan tanpa body", async () => {
    const fetchMock = mockFetch(ok);
    const result = await apiGet("/aucations");
    expect(result).toEqual(ok);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://open-api.delcom.org/api/v1/aucations");
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body).toBeUndefined();
  });

  it("GET dengan query parameter (nilai undefined diabaikan)", async () => {
    const fetchMock = mockFetch(ok);
    await apiGet("/aucations", { is_me: 1, is_closed: 0, skip: undefined });
    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("is_me=1");
    expect(url).toContain("is_closed=0");
    expect(url).not.toContain("skip");
  });

  it("menyertakan header Authorization jika token ada", async () => {
    putAccessToken("token-123");
    const fetchMock = mockFetch(ok);
    await apiGet("/users/me");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-123");
  });

  it("POST mengirim body JSON", async () => {
    const fetchMock = mockFetch(ok);
    await apiPost("/auth/login", { email: "a@b.co" });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.co" }));
  });

  it("POST dengan FormData tidak memaksa Content-Type", async () => {
    const fetchMock = mockFetch(ok);
    const form = new FormData();
    form.append("cover", new File(["x"], "c.png", { type: "image/png" }));
    await apiPost("/aucations/1/cover", form);
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("PUT dan DELETE memakai method yang benar", async () => {
    const fetchMock = mockFetch(ok);
    await apiPut("/aucations/1", { title: "x" });
    await apiDelete("/aucations/1");
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    expect(fetchMock.mock.calls[1][1].method).toBe("DELETE");
  });

  it("melempar error berisi pesan dan data saat status bukan success", async () => {
    mockFetch({ status: "fail", message: "Data tidak valid", data: { field: ["x"] } });
    await expect(apiFetch("/x", { method: "GET" })).rejects.toMatchObject({
      message: "Data tidak valid",
      data: { field: ["x"] },
    });
  });

  it("melempar error jika respons bukan JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => {
        throw new Error("bad json");
      },
    });
    await expect(apiGet("/x")).rejects.toThrow("Respons server tidak valid");
  });

  it("meneruskan error jaringan", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network down"));
    await expect(apiGet("/x")).rejects.toThrow("Network down");
  });
});
