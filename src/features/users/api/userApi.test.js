import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../helpers/apiHelper.js";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi.js";

vi.mock("../../../helpers/apiHelper.js", () => ({ apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn() }));

describe("userApi", () => {
  beforeEach(() => {
    api.apiGet.mockResolvedValue("get");
    api.apiPost.mockResolvedValue("post");
    api.apiPut.mockResolvedValue("put");
  });

  it("getUsers -> GET /users", async () => {
    expect(await getUsers()).toBe("get");
    expect(api.apiGet).toHaveBeenCalledWith("/users");
  });

  it("getMe -> GET /users/me", async () => {
    await getMe();
    expect(api.apiGet).toHaveBeenCalledWith("/users/me");
  });

  it("putMe -> PUT /users/me", async () => {
    expect(await putMe("Budi", "a@b.co")).toBe("put");
    expect(api.apiPut).toHaveBeenCalledWith("/users/me", { name: "Budi", email: "a@b.co" });
  });

  it("postPhoto -> POST /users/me/photo dengan FormData", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    expect(await postPhoto(file)).toBe("post");
    const [path, form] = api.apiPost.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("photo").name).toBe("foto.png");
  });

  it("putPassword -> PUT /users/me/password", async () => {
    await putPassword("lama", "baru12", "baru12");
    expect(api.apiPut).toHaveBeenCalledWith("/users/me/password", {
      password: "lama",
      new_password: "baru12",
      new_password_confirmation: "baru12",
    });
  });
});
