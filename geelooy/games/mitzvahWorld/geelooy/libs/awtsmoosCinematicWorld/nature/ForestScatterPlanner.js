// B"H
import { SeededRandom } from "../core/SeededRandom.js";
import { speciesNames, getSpecies } from "./TreeSpeciesRegistry.js";
import { makeTreePlan } from "./ProceduralTreeBuilder.js";
/** ForestScatterPlanner: a forest that opens, tightens, and opens again. */
export class ForestScatterPlanner {
  constructor({ seed = 770, density = 0.65 } = {}) { this.rng = new SeededRandom(seed); this.density = density; }
  plan({ count = 80, width = 36, depth = 48, pathWidth = 4 } = {}) {
    const names = speciesNames(), trees = [];
    for (let i = 0; i < count; i++) {
      const z = this.rng.range(-depth, 6), x = this.rng.range(-width / 2, width / 2);
      if (Math.abs(x) < pathWidth * (0.7 + Math.max(0, -z) / depth)) continue;
      const species = this.rng.choice(names), spec = getSpecies(species);
      trees.push({ ...makeTreePlan({ species, height: this.rng.range(...spec.height), radius: this.rng.range(...spec.radius), twist: this.rng.range(0, Math.PI), id: `tree-${i}` }), x, z });
    }
    return trees;
  }
}
export default ForestScatterPlanner;
