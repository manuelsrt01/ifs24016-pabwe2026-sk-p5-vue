import { ref } from "vue";

// Pembungkus async action Pinia: mengatur flag loading/done + pesan sukses/error.
export function createRunner() {
  const error = ref("");
  const message = ref("");

  async function run(loading, done, task) {
    loading.value = true;
    done.value = false;
    error.value = "";
    try {
      message.value = await task();
      done.value = true;
      return true;
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { error, message, run };
}
