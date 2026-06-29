// B"H
// Wind is sampled, not guessed: a soft force field for every subsystem.
import { curl } from "./noise.js";
export function createWindField() {
  let strength = .5;
  function update(t, weather = "dust") { strength = weather === "rain" ? .8 : .45; return strength; }
  function sample(x, y, t) { const c = curl(x * .002, y * .002, t * .07); return { x: c.x * strength, y: c.y * strength }; }
  return { update, sample, strength: () => strength };
}
