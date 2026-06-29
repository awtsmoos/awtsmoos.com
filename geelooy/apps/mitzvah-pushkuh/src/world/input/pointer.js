// B"H
// Pointer helpers normalize the hand into a point.
export const pointFrom = e => ({ x: e.clientX, y: e.clientY, id: e.pointerId });
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
