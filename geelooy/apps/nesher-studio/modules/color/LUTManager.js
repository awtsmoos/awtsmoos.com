/* B"H */
export function createLUTManager(input = {}) { return { kind:'LUTManager', luts:new Map(input.luts || []) }; }
export function registerLUT(manager, id, mapPixel) { const lut = { id, mapPixel }; manager.luts.set(id, lut); return lut; }
export function getLUT(manager, id) { return manager.luts.get(id) || null; }
export function createIdentityLUT(id = 'identity') { return { id, mapPixel:pixel => pixel }; }
