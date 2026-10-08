import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils.js";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404 dan link kembali", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);
    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman tidak ditemukan");
    expect(wrapper.find('a[href="/"]').exists()).toBe(true);
  });
});
