// B"H
// Terrain pass draws the cached base vessel.
export const terrainPass = () => (ctx, s) => s.layers.bg ? ctx.drawImage(s.layers.bg, 0, 0) : ctx.clearRect(0, 0, s.w, s.h);
