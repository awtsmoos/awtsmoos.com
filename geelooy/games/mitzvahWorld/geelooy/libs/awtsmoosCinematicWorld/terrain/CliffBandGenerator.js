// B"H
import { SeededRandom } from "../core/SeededRandom.js";
/** CliffBandGenerator: sudden walls of ascent, where yesterday's freedom narrows. */
export class CliffBandGenerator {
  constructor({ seed = 86 } = {}) { this.rng = new SeededRandom(seed); }
  makeBands({ count = 5, width = 44, startZ = -18, spacing = 9 } = {}) {
    return Array.from({ length: count }, (_, i) => ({
      id: `cliff-band-${i + 1}`, x: this.rng.range(-width * 0.35, width * 0.35), z: startZ - i * spacing,
      height: this.rng.range(2.4, 8.5), length: this.rng.range(8, 18), roughness: this.rng.range(0.25, 0.9)
    }));
  }
}
export default CliffBandGenerator;
