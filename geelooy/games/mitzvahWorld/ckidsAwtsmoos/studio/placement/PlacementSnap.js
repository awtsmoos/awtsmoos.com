// B"H
export function snapPosition(position = {}, grid = 1) {
  const g = Math.max(.01, Number(grid) || 1);
  return { x:Math.round((Number(position.x) || 0) / g) * g, y:Math.round((Number(position.y) || 0) / g) * g, z:Math.round((Number(position.z) || 0) / g) * g };
}
export default { snapPosition };
