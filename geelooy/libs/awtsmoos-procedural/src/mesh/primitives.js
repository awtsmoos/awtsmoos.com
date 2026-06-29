/**
 * B"H
 * @chapter The cube became honest: six faces, no lie, no framework.
 */
export function cubeMesh({ center = [0, 0, 0], size = [1, 1, 1], color = [1, 1, 1, 1] } = {}) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size.map(v => Math.max(0.001, Math.abs(v)) / 2);
  const p = [
    cx-sx,cy-sy,cz-sz, cx+sx,cy-sy,cz-sz, cx+sx,cy+sy,cz-sz, cx-sx,cy+sy,cz-sz,
    cx-sx,cy-sy,cz+sz, cx+sx,cy-sy,cz+sz, cx+sx,cy+sy,cz+sz, cx-sx,cy+sy,cz+sz
  ];
  const i = [0,1,2,0,2,3, 4,6,5,4,7,6, 0,4,5,0,5,1, 3,2,6,3,6,7, 1,5,6,1,6,2, 0,3,7,0,7,4];
  return { positions: p, indices: i, colors: Array(8).fill(color).flat() };
}
