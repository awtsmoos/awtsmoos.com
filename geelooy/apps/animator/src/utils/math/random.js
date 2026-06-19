/* B”H */
export class Random {
  static float(min, max) {
    return Math.random() * (max - min) + min;
  }
  static int(min, max) {
    return Math.floor(this.float(min, max + 1));
  }
  static pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }
}
