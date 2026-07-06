// B"H
/** @file LoadStepCatalog.js @description Chapter 801: the loading screen becomes honest because every gate has a name. */
export const LOAD_STEPS = Object.freeze([
  ["runtime:install", 3, "Opening the world vessel"], ["assets:model", 12, "Loading the chossid model"],
  ["assets:textures", 10, "Preparing terrain and material memory"], ["world:terrain", 12, "Raising land, rivers, roads, and villages"],
  ["world:actors", 12, "Awakening NPCs and kosher animals"], ["studio:tools", 8, "Sharpening World Studio tools"],
  ["movie:compiler", 8, "Preparing cameras and timeline tracks"], ["animations:runtime", 10, "Binding animation states"],
  ["browser:bridge", 5, "Exposing debug controls"], ["runtime:playable", 20, "Waiting for the first playable frame"]
]);
export function loadStepRecords() { return LOAD_STEPS.map(([id, weight, label]) => ({ id, weight, label })); }
export default loadStepRecords;
