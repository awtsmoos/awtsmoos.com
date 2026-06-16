// B"H
/** @file InteriorSocketPlanner.js @description Named sockets for semantic cottage interiors. */
export function interiorSockets(house = {}, spec = {}) { const w=(spec.width||house.sx||6.2)/2, d=(spec.depth||house.sz||5.4)/2; return { bed:{ x:-w+.95, y:.18, z:-d+.9 }, table:{ x:.35, y:.28, z:-.25 }, hearth:{ x:w-.75, y:.28, z:-d+.65 }, storage:{ x:-w+.75, y:.28, z:d-.75 }, profession:{ x:w-1.05, y:.28, z:.7 }, lamp:{ x:.35, y:.72, z:-.25 }, doorClear:{ x:0, y:.05, z:d-.7 } }; }
export default interiorSockets;
