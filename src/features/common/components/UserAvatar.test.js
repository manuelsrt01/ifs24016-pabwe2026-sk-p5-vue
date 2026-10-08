import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import UserAvatar from "./UserAvatar.vue";

describe("UserAvatar", () => {
  it("menampilkan foto (path relatif dijadikan URL penuh)", () => {
    const wrapper = mount(UserAvatar, { props: { photo: "img/profile/1.png", name: "Budi" } });
    expect(wrapper.find("img").attributes("src")).toBe("https://open-api.delcom.org/img/profile/1.png");
    expect(wrapper.find("img").attributes("alt")).toBe("Budi");
  });

  it("menampilkan inisial jika tidak ada foto", () => {
    const wrapper = mount(UserAvatar, { props: { name: "budi", sizeClass: "h-20 w-20" } });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.get('[data-testid="avatar-initial"]').text()).toBe("B");
    expect(wrapper.get('[data-testid="avatar-initial"]').classes()).toContain("h-20");
  });
});
