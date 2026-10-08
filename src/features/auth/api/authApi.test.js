import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../helpers/apiHelper.js";
import { postLogin, postRegister } from "./authApi.js";

vi.mock("../../../helpers/apiHelper.js", () => ({ apiPost: vi.fn() }));

describe("authApi", () => {
  beforeEach(() => {
    api.apiPost.mockResolvedValue({ status: "success" });
  });

  it("postLogin memanggil POST /auth/login", async () => {
    const result = await postLogin("a@b.co", "123456");
    expect(api.apiPost).toHaveBeenCalledWith("/auth/login", { email: "a@b.co", password: "123456" });
    expect(result).toEqual({ status: "success" });
  });

  it("postRegister memanggil POST /auth/register", async () => {
    await postRegister("Budi", "a@b.co", "123456");
    expect(api.apiPost).toHaveBeenCalledWith("/auth/register", {
      name: "Budi",
      email: "a@b.co",
      password: "123456",
    });
  });
});
