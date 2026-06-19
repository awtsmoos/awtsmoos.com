// B"H
export class LightLogic {
  static getAmbient(time) {
    const d = new Date(time);
    const hour = d.getHours();
    return hour > 18 || hour < 6 ? '#1a1a2e' : '#87ceeb';
  }
}
