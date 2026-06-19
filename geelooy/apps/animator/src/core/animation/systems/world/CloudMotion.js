// B"H
export class CloudMotion {
  static getPosition(time, speed) {
    return (time * speed) % 2000;
  }
}
