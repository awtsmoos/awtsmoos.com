// B"H
export function createPlacementGrid(size = 160, step = 1) {
  return { size, step, lines:Math.floor(size / step) + 1, visible:true };
}
export default { createPlacementGrid };
