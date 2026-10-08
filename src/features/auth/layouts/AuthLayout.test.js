import { defineComponent, h } from "vue";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "../../../test-utils.js";
import AuthLayout from "./AuthLayout.vue";

const Child = defineComponent({ render: () => h("p", "isi halaman auth") });

describe("AuthLayout", () => {
  it("menampilkan banner dan konten rute anak", async () => {
    const { wrapper } = await renderRoutes(
      [{ path: "/auth", component: AuthLayout, children: [{ path: "login", component: Child }] }],
      "/auth/login",
    );
    expect(wrapper.find('[data-testid="auth-banner"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("isi halaman auth");
  });
});
