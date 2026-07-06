// B"H
export function generateVillage(seed = 1) { return { seed, buildings:[{ type:"cottage", x:0, z:0 }], roads:[{ from:[-10, 0], to:[10, 0] }] }; }
export default { generateVillage };
