
// B"H
export class ToastTimer {
  static timers = new Map();

  static schedule(id, duration, callback) {
    const timerId = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, duration);
    
    this.timers.set(id, timerId);
  }

  static clear(id) {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
  }
}
