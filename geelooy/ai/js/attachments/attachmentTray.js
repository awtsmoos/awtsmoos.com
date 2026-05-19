//B"H
import { AttachmentStore } from "./attachmentStore.js";

/** Mounts paste, drop, file-pick, preview, and removal for image sparks. */
export class AttachmentTray {
  constructor({ tray, input, fileInput }) {
    this.tray = tray;
    this.input = input;
    this.fileInput = fileInput;
    this.store = new AttachmentStore();
  }

  mount() {
    this.input.addEventListener("paste", event => this.add(event.clipboardData?.files));
    this.input.addEventListener("drop", event => { event.preventDefault(); this.add(event.dataTransfer?.files); });
    this.input.addEventListener("dragover", event => event.preventDefault());
    this.fileInput.addEventListener("change", () => this.add(this.fileInput.files));
    this.render();
  }

  consume() { const items = this.store.list(); this.store.clear(); this.render(); return items; }
  list() { return this.store.list(); }

  add(files) {
    if (!files?.length) return;
    this.store.addFiles(files);
    this.fileInput.value = "";
    this.render();
  }

  render() {
    const items = this.store.list();
    this.tray.innerHTML = items.map(item => `
      <figure class="attachment-chip" data-id="${item.id}">
        <img src="${item.url}" alt="${item.name}">
        <figcaption>${item.name}</figcaption>
        <button title="Remove image">×</button>
      </figure>`).join("");
    this.tray.querySelectorAll("button").forEach(button => button.onclick = () => {
      this.store.remove(button.closest(".attachment-chip").dataset.id);
      this.render();
    });
  }
}
