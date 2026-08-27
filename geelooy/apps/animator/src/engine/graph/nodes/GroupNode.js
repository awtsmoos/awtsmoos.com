// B"H
export const GroupNode = {
  create: (id, transform, children, style = {}) => ({
    type: 'group',
    id,
    transform: transform || { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    style,
    children: (children || []).filter(Boolean)
  })
};