// B"H
export class BlinkProcessor {
  static calculate(time, freq = 0.1) {
    const cycle = (time * freq) % 10; // 10 second loop
    if (cycle > 9.8) return Math.sin((cycle - 9.8) * Math.PI * 5); // Fast blink
    return 0;
  }
}
