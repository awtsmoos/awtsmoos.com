
/* B”H */
export class ClipboardManager {
  constructor() {
    this.buffer = null;
  }
  copy(event) { this.buffer = JSON.parse(JSON.stringify(event)); }
  paste() { return this.buffer ? JSON.parse(JSON.stringify(this.buffer)) : null; }
}
