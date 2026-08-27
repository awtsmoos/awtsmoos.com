/**
 * B"H
 * @chapter The broken triangles were counted, not shamed, then lifted.
 */
export function validateMesh(mesh, options = {}) {
  const maxAbs = options.maxAbs ?? 100000;
  const issues = [];
  const positions = mesh?.positions;
  const indices = mesh?.indices;
  if (!Array.isArray(positions)) issues.push('positions must be an array');
  if (!Array.isArray(indices)) issues.push('indices must be an array');
  if (issues.length) return { ok: false, issues };
  if (positions.length % 3) issues.push('positions length must be divisible by 3');
  if (indices.length % 3) issues.push('indices length must be divisible by 3');
  positions.forEach((value, i) => {
    if (!Number.isFinite(value)) issues.push(`position ${i} is not finite`);
    if (Math.abs(value) > maxAbs) issues.push(`position ${i} exceeds maxAbs ${maxAbs}`);
  });
  const vertexCount = Math.floor(positions.length / 3);
  indices.forEach((index, i) => {
    if (!Number.isInteger(index)) issues.push(`index ${i} is not an integer`);
    if (index < 0 || index >= vertexCount) issues.push(`index ${i} is out of range`);
  });
  return { ok: issues.length === 0, issues };
}
