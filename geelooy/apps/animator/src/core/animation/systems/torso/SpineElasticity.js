// B"H
export class SpineElasticity {
  static getCurve(bob, speed) {
    return (bob * 0.1) + (speed * 0.05);
  }
}
