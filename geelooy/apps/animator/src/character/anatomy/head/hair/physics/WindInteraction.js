// B"H
export class WindInteraction {
  static apply(pos, time, intensity) {
    return pos + Math.sin(time * 0.005 + pos) * intensity;
  }
}
