import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../helpers/apiHelper.js";
import {
  deleteAllAucations,
  deleteAucation,
  deleteBid,
  getAucation,
  getAucations,
  postAucation,
  postBid,
  postCover,
  putAucation,
} from "./aucationApi.js";

vi.mock("../../../helpers/apiHelper.js", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("aucationApi", () => {
  beforeEach(() => {
    api.apiGet.mockResolvedValue("get");
    api.apiPost.mockResolvedValue("post");
    api.apiPut.mockResolvedValue("put");
    api.apiDelete.mockResolvedValue("delete");
  });

  it("getAucations meneruskan filter is_me dan is_closed", async () => {
    expect(await getAucations({ is_me: 1, is_closed: 0 })).toBe("get");
    expect(api.apiGet).toHaveBeenCalledWith("/aucations", { is_me: 1, is_closed: 0 });
  });

  it("getAucation -> GET /aucations/:id", async () => {
    await getAucation(5);
    expect(api.apiGet).toHaveBeenCalledWith("/aucations/5");
  });

  it("postAucation -> POST /aucations", async () => {
    const payload = { title: "A", description: "B", start_bid: 1000, closed_at: "2026-12-31 23:59:59" };
    expect(await postAucation(payload)).toBe("post");
    expect(api.apiPost).toHaveBeenCalledWith("/aucations", payload);
  });

  it("putAucation -> PUT /aucations/:id", async () => {
    await putAucation(5, { title: "X" });
    expect(api.apiPut).toHaveBeenCalledWith("/aucations/5", { title: "X" });
  });

  it("postCover -> POST /aucations/:id/cover dengan FormData", async () => {
    const file = new File(["x"], "cover.png", { type: "image/png" });
    await postCover(5, file);
    const [path, form] = api.apiPost.mock.calls[0];
    expect(path).toBe("/aucations/5/cover");
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("cover").name).toBe("cover.png");
  });

  it("deleteAucation -> DELETE /aucations/:id", async () => {
    expect(await deleteAucation(5)).toBe("delete");
    expect(api.apiDelete).toHaveBeenCalledWith("/aucations/5");
  });

  it("postBid -> POST /aucations/:id/bids", async () => {
    await postBid(5, 10000);
    expect(api.apiPost).toHaveBeenCalledWith("/aucations/5/bids", { bid: 10000 });
  });

  it("deleteBid -> DELETE /aucations/:id/bids", async () => {
    await deleteBid(5);
    expect(api.apiDelete).toHaveBeenCalledWith("/aucations/5/bids");
  });

  it("deleteAllAucations -> DELETE /aucations", async () => {
    await deleteAllAucations();
    expect(api.apiDelete).toHaveBeenCalledWith("/aucations");
  });
});
