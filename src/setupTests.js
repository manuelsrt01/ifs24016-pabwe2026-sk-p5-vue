import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import Swal from "sweetalert2";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

vi.mock("@toast-ui/editor", () => ({
  default: class MockEditor {
    constructor(options) {
      this.options = options;
      this.getMarkdown = vi.fn(() => "# Judul");
      this.destroy = vi.fn();
      globalThis.__toast.editors.push(this);
    }

    // Editor.factory({ viewer: true }) dipakai oleh MarkdownViewer
    static factory(options) {
      const viewer = { options, setMarkdown: vi.fn(), destroy: vi.fn() };
      globalThis.__toast.viewers.push(viewer);
      return viewer;
    }
  },
}));

globalThis.__toast = { editors: [], viewers: [] };

// jsdom tidak punya URL.createObjectURL
URL.createObjectURL = vi.fn(() => "blob:preview");
URL.revokeObjectURL = vi.fn();

beforeEach(() => {
  localStorage.clear();
  globalThis.__toast.editors.length = 0;
  globalThis.__toast.viewers.length = 0;
  URL.createObjectURL.mockClear();
  URL.revokeObjectURL.mockClear();
  Swal.fire.mockReset();
  Swal.fire.mockResolvedValue({ isConfirmed: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});
