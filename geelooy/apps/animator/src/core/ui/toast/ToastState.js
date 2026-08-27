
// B"H
export class ToastState {
  static activeToasts = [];

  static add(toast) {
    this.activeToasts.push(toast);
    // Cap at 5 messages so the screen isn't overwhelmed
    if (this.activeToasts.length > 5) this.activeToasts.shift();
  }

  static remove(id) {
    this.activeToasts = this.activeToasts.filter(t => t.id !== id);
  }

  static getActive() {
    return this.activeToasts;
  }
}
