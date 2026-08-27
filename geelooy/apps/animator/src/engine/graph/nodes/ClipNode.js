// B"H
export const ClipNode = {
  create: (id, transform, clipPathPoints, children) => ({
    type: 'clip',
    id,
    transform: transform || { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    clipPathPoints,
    children: (children || []).filter(Boolean)
  })
};