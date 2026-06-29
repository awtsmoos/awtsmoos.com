/**
 * B"H
 * @chapter Degenerate sparks fell away so the visible vessel could stand.
 */
export function compactFiniteMesh(mesh) {
  const positions = mesh.positions || [];
  const indices = mesh.indices || [];
  const cleanPositions = [];
  const map = new Map();
  for (let i = 0; i < positions.length; i += 3) {
    const v = [positions[i], positions[i + 1], positions[i + 2]];
    if (!v.every(Number.isFinite)) continue;
    map.set(i / 3, cleanPositions.length / 3);
    cleanPositions.push(...v);
  }
  const cleanIndices = [];
  for (let i = 0; i < indices.length; i += 3) {
    const tri = [map.get(indices[i]), map.get(indices[i + 1]), map.get(indices[i + 2])];
    if (tri.some(v => v === undefined)) continue;
    if (tri[0] === tri[1] || tri[1] === tri[2] || tri[0] === tri[2]) continue;
    cleanIndices.push(...tri);
  }
  return { ...mesh, positions: cleanPositions, indices: cleanIndices };
}
