// B"H
export function generatePath(from = [0, 0], to = [10, 0]) { return { points:[from, [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2], to], width:2 }; }
export default { generatePath };
