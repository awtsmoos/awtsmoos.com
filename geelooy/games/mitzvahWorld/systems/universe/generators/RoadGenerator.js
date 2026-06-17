// B"H
/** Roads connect regions, buildings, and story places. */
export function generateRoadCommands(universe = {}) {
  const roads = universe.roads || [];
  return roads.map((r, i) => ({ type:"road", id:r.id || `road_${i+1}`, from:r.from || null, to:r.to || null, style:r.style || "village_path", command:"ensure_road", source:r }));
}
export default generateRoadCommands;
