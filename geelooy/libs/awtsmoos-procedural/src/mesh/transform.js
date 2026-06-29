// B"H

/**
 * B"H
 * Chapter 2: The Awtsmoos lets one vessel become many without breaking truth.
 * Transform helpers never mutate input meshes; they return new raw mesh data.
 */
export function transformMesh(mesh, opts = {}) {
  const scale = axis(opts.scale, 1);
  const translate = axis(opts.translate, 0);
  const positions = [];
  for (let i = 0; i < (mesh.positions || []).length; i += 3) {
    positions.push(
      mesh.positions[i] * scale[0] + translate[0],
      mesh.positions[i + 1] * scale[1] + translate[1],
      mesh.positions[i + 2] * scale[2] + translate[2]
    );
  }
  return {
    ...mesh,
    positions,
    indices: [...(mesh.indices || [])],
    colors: [...(mesh.colors || [])]
  };
}

export function recolorMesh(mesh, color = [1, 1, 1, 1]) {
  return {
    ...mesh,
    positions: [...(mesh.positions || [])],
    indices: [...(mesh.indices || [])],
    colors: Array.from({ length: (mesh.positions || []).length / 3 }, () => color).flat()
  };
}

export function mergeMeshes(meshes = []) {
  const out = { positions: [], indices: [], colors: [] };
  for (const mesh of meshes.filter(Boolean)) mergeInto(out, mesh);
  return out;
}

export function cloneMesh(mesh) {
  return {
    ...mesh,
    positions: [...(mesh.positions || [])],
    indices: [...(mesh.indices || [])],
    colors: [...(mesh.colors || [])]
  };
}

function mergeInto(out, mesh) {
  const offset = out.positions.length / 3;
  out.positions.push(...(mesh.positions || []));
  out.indices.push(...(mesh.indices || []).map(index => index + offset));
  if (mesh.colors?.length) out.colors.push(...mesh.colors);
}

function axis(value, fallback) {
  if (Array.isArray(value)) return [0, 1, 2].map(i => finite(value[i], fallback));
  const scalar = finite(value, fallback);
  return [scalar, scalar, scalar];
}

function finite(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
