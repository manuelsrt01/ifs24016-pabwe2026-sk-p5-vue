import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MarkdownViewer from "./MarkdownViewer.vue";

describe("MarkdownViewer", () => {
  it("menginisialisasi Viewer dengan konten", () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "**tebal**" } });
    const viewer = globalThis.__toast.viewers[0];
    expect(viewer.options.el).toBe(wrapper.get('[data-testid="markdown-viewer"]').element);
    expect(viewer.options.initialValue).toBe("**tebal**");
  });

  it("memperbarui konten saat prop berubah dan menghancurkan viewer saat unmount", async () => {
    const wrapper = mount(MarkdownViewer);
    const viewer = globalThis.__toast.viewers[0];
    expect(viewer.options.initialValue).toBe("");
    await wrapper.setProps({ content: "baru" });
    expect(viewer.setMarkdown).toHaveBeenCalledWith("baru");
    wrapper.unmount();
    expect(viewer.destroy).toHaveBeenCalledOnce();
  });
});
