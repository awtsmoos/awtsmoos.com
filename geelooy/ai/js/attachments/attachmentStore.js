//B"H
/** Keeps pasted/dropped files alive only for this browser session. */
export class AttachmentStore {
  constructor() { this.items = []; }

  addFiles(files) {
    const added = [...files].filter(file => file?.type?.startsWith("image/")).map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name || "pasted-image.png",
      type: file.type || "image/png",
      size: file.size || 0,
      url: URL.createObjectURL(file)
    }));
    this.items.push(...added);
    return this.list();
  }

  remove(id) {
    const item = this.items.find(entry => entry.id === id);
    if (item) URL.revokeObjectURL(item.url);
    this.items = this.items.filter(entry => entry.id !== id);
    return this.list();
  }

  clear() { this.items.forEach(item => URL.revokeObjectURL(item.url)); this.items = []; }
  list() { return [...this.items]; }
}
