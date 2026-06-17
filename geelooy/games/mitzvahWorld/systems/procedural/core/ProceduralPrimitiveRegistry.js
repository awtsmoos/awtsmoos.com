// B"H
export const PRIMITIVES = Object.freeze(["box","plane","sphere","cylinder","cone","mountain","tree","fence","path","house","branch_house","rigged_human","animal","cloud","ark"]);
export function hasPrimitive(name) { return PRIMITIVES.includes(name); }
