// B"H
import { SeededRandom } from "../core/SeededRandom.js";
import { clamp, smoothstep } from "../core/VectorMath.js";
/** HeightFieldGenerator: hills that remember the forty-two journeys. */
export class HeightFieldGenerator {
  constructor({ seed = 42, amplitude = 5, ridgeStrength = 3 } = {}) { this.rng = new SeededRandom(seed); this.amplitude = amplitude; this.ridgeStrength = ridgeStrength; }
  wave(x, z, f, phase) { return Math.sin(x * f + phase) * Math.cos(z * f * 0.73 + phase * 1.37); }
  heightAt(x, z, regionIndex = 0) {
    const base = this.wave(x, z, 0.055, 1.7) * 0.9 + this.wave(x, z, 0.13, 4.1) * 0.38;
    const ascent = smoothstep(-38, 38, -z) * (regionIndex + 1) * 0.85;
    const ridge = Math.pow(Math.abs(Math.sin((x + z * 0.33) * 0.08)), 7) * this.ridgeStrength;
    return clamp(base * this.amplitude + ascent + ridge, -3, 18);
  }
  grid({ size = 48, segments = 24, regionIndex = 0 } = {}) {
    const points = [];
    for (let iz = 0; iz <= segments; iz++) for (let ix = 0; ix <= segments; ix++) {
      const x = (ix / segments - 0.5) * size, z = (iz / segments - 0.5) * size;
      points.push({ x, y: this.heightAt(x, z, regionIndex), z });
    }
    return { size, segments, points };
  }
}
export default HeightFieldGenerator;
