// B"H
/**
 * @file attachmentStore.js
 * @description
 * Chapter 11: The tray stopped being only an eye and became an ear too. Images,
 * audio, and video are kept for the browser session with object URLs for the UI
 * and data URLs for provider payloads. Unsupported files are refused honestly.
 */
const ACCEPTED = /^(image|audio|video)\//i;

export class AttachmentStore {
  constructor() { this.items = []; }

  async addFiles(files) {
    const added = [];
    for (const file of [...files].filter(item => ACCEPTED.test(item?.type || ""))) {
      added.push({
        id: crypto.randomUUID(),
        file,
        name: file.name || defaultName(file.type),
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        url: URL.createObjectURL(file),
        dataUrl: await readDataUrl(file)
      });
    }
    this.items.push(...added);
    return this.list();
  }

  remove(id) {
    const item = this.items.find(entry => entry.id === id);
    if (item) URL.revokeObjectURL(item.url);
    this.items = this.items.filter(entry => entry.id !== id);
    return this.list();
  }

  clear() {
    this.items.forEach(item => URL.revokeObjectURL(item.url));
    this.items = [];
  }

  list() { return [...this.items]; }
}

function defaultName(type = "") {
  if (type.startsWith("audio/")) return "recorded-audio.webm";
  if (type.startsWith("video/")) return "attached-video.mp4";
  return "pasted-image.png";
}

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("attachment_read_failed"));
    reader.readAsDataURL(file);
  });
}
