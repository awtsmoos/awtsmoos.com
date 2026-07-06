// B"H
export function createPlacementPreview(kind = "object", position = { x:0, y:0, z:0 }) {
  return { kind, position, valid:true, collision:"pending" };
}
export default { createPlacementPreview };
