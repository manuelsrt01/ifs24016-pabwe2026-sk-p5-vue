import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { createRunner } from "./storeHelper.js";

describe("createRunner", () => {
  it("sukses: set flag, pesan, dan mengembalikan true", async () => {
    const { run, message, error } = createRunner();
    const loading = ref(false);
    const done = ref(false);
    let during;
    const result = await run(loading, done, async () => {
      during = loading.value;
      return "selesai";
    });
    expect(during).toBe(true);
    expect(result).toBe(true);
    expect(loading.value).toBe(false);
    expect(done.value).toBe(true);
    expect(message.value).toBe("selesai");
    expect(error.value).toBe("");
  });

  it("gagal: set error dan mengembalikan false", async () => {
    const { run, error } = createRunner();
    const loading = ref(false);
    const done = ref(true);
    const result = await run(loading, done, async () => {
      throw new Error("gagal");
    });
    expect(result).toBe(false);
    expect(error.value).toBe("gagal");
    expect(done.value).toBe(false);
    expect(loading.value).toBe(false);
  });
});
