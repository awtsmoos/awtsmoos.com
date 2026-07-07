// B"H
/** JourneyFogController: mist of constriction becoming light of expanse. */
export class JourneyFogController {
  constructor({ color = 0x9fd5ff } = {}) { this.color = color; }
  stateAt(t) {
    const narrow = Math.max(0, 1 - Math.abs(t - 0.33) * 5);
    const summit = Math.max(0, (t - 0.72) / 0.28);
    return { color: this.color, near: 8 + narrow * 2 + summit * 10, far: 38 - narrow * 18 + summit * 55, density: 0.012 + narrow * 0.025 - summit * 0.006 };
  }
}
export default JourneyFogController;
