// B"H
export const WHITE = [1, 1, 1, 1];

/**
 * B"H
 * The point enters the vessel only when it is finite; the Awtsmoos gives it room.
 */
export function mesh(positions = [], indices = [], color = WHITE) {
  return {
    positions,
    indices,
    colors: Array.from({ length: positions.length / 3 }, () => color).flat()
  };
}

export function safeSegments(value, min) {
  return Math.max(min, Math.floor(value || min));
}

export function onPlane(x, z, plane) {
  if (plane === 'xy') return [x, z, 0];
  if (plane === 'yz') return [0, x, z];
  return [x, 0, z];
}
