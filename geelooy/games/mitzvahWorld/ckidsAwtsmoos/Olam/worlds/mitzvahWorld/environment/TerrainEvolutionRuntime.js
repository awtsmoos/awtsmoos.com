// B"H
/** TerrainEvolutionRuntime: WetnessMap, ErosionMap, SedimentMap, FlowMap, VegetationMap, FootpathMap. */
const nonnegative = value => Math.max(0, Number(value) || 0);
const empty = () => ({ wetness:0, erosion:0, sediment:0, flow:0, vegetation:1, footpath:0, wear:0 });

export class TerrainEvolutionRuntime {
  constructor() {
    this.cells = new Map();
    this.events = [];
    this.maps = ["wetness", "erosion", "sediment", "flow", "vegetation", "footpath"];
  }

  ensure(id) {
    if (!this.cells.has(id)) this.cells.set(id, empty());
    return this.cells.get(id);
  }

  mark(id, patch, reason = "terrain_memory") {
    const cell = this.ensure(id);
    for (const [key, value] of Object.entries(patch)) cell[key] = nonnegative(value);
    this.events.unshift({ id, patch, reason, at:Date.now() });
    this.events.length = Math.min(this.events.length, 160);
    return cell;
  }

  stepOn(id, weight = 1) {
    const cell = this.ensure(id);
    return this.mark(id, { wear:cell.wear + weight, footpath:cell.footpath + weight * .012, vegetation:cell.vegetation - weight * .006 }, "footfall");
  }

  rain(amount = .2) {
    const changed = [];
    for (const [id, cell] of this.cells) changed.push({ id, ...this.mark(id, { wetness:cell.wetness + amount, flow:cell.flow + amount * .25, vegetation:cell.vegetation + amount * .05 }, "rain") });
    return changed;
  }

  dry(amount = .05) {
    const changed = [];
    for (const [id, cell] of this.cells) changed.push({ id, ...this.mark(id, { wetness:cell.wetness - amount, flow:cell.flow - amount * .1 }, "dry") });
    return changed;
  }

  erode(id, flow = .1) {
    const cell = this.ensure(id);
    return this.mark(id, { erosion:cell.erosion + flow * .03, sediment:cell.sediment + flow * .02, vegetation:cell.vegetation - flow * .01 }, "erosion");
  }

  visualField(name, limit = 120) {
    return [...this.cells.entries()].map(([id, cell]) => [id, cell[name] || 0]).filter(item => item[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, limit);
  }

  snapshot() {
    return { cells:this.cells.size, events:this.events.slice(0, 12), maps:Object.fromEntries(this.maps.map(name => [name, this.visualField(name, 24)])) };
  }
}

export default TerrainEvolutionRuntime;
