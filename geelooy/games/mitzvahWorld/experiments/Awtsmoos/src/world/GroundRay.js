// B"H
/** GroundRay: one beginning ray, so the soles kiss Eretz and do not float. */
export function alignModelFeetToGround(model, groundY = 0) {
  model.updateWorldMatrix?.();
  const minY = findMinWorldY(model);
  if (!Number.isFinite(minY)) return { minY: null, offset: 0 };
  const offset = groundY - minY;
  model.position.y += offset;
  model.setBaseTransform?.();
  return { minY, offset };
}

export function findMinWorldY(root) {
  let minY = Infinity;
  root.traverse((object) => {
    const position = object.geometry?.attributes?.position;
    const matrix = object.matrixWorld;
    if (!position || !matrix) return;
    const array = position.array;
    for (let i = 0; i < array.length; i += 3) {
      const y = matrix[1] * array[i] + matrix[5] * array[i + 1] + matrix[9] * array[i + 2] + matrix[13];
      if (y < minY) minY = y;
    }
  });
  return minY;
}
