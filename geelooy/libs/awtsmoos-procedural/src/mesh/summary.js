/**
 * B"H
 * @chapter The mesh confessed its borders before the King who makes borders.
 * Some colors arrive as RGB, some as RGBA; the summary judges them honestly.
 */
export function summarizeMesh(mesh) {
  const positions = mesh?.positions || [];
  const indices = mesh?.indices || [];
  const vertexCount = positions.length / 3;
  const bounds = makeBounds();
  for (let i = 0; i < positions.length; i += 3) includePoint(bounds, positions, i);
  return {
    vertices: vertexCount,
    triangles: indices.length / 3,
    bounds: positions.length ? bounds : null,
    hasColors: hasVertexColors(mesh?.colors, vertexCount),
    hasNormals: Array.isArray(mesh?.normals) && mesh.normals.length === positions.length
  };
}

function makeBounds() {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}

function includePoint(bounds, positions, offset) {
  for (let axis = 0; axis < 3; axis += 1) {
    const value = positions[offset + axis];
    bounds.min[axis] = Math.min(bounds.min[axis], value);
    bounds.max[axis] = Math.max(bounds.max[axis], value);
  }
}

function hasVertexColors(colors, vertexCount) {
  if (!Array.isArray(colors)) return false;
  return colors.length === vertexCount * 3 || colors.length === vertexCount * 4;
}
