import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MarkdownEditor from "./MarkdownEditor.vue";

describe("MarkdownEditor", () => {
  it("menginisialisasi Editor dengan props dan meneruskan event change", () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "# Awal", placeholder: "Tulis...", height: "300px" },
    });
    const editor = globalThis.__toast.editors[0];
    expect(editor.options.el).toBe(wrapper.get('[data-testid="markdown-editor"]').element);
    expect(editor.options).toMatchObject({
      initialValue: "# Awal",
      placeholder: "Tulis...",
      height: "300px",
      usageStatistics: false,
    });

    editor.options.events.change();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["# Judul"]);
  });

  it("memakai nilai default dan menghancurkan editor saat unmount", () => {
    const wrapper = mount(MarkdownEditor);
    const editor = globalThis.__toast.editors[0];
    expect(editor.options.initialValue).toBe("");
    expect(editor.options.height).toBe("260px");
    wrapper.unmount();
    expect(editor.destroy).toHaveBeenCalledOnce();
  });
});
