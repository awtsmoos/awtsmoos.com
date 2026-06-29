// B"H
// Procedural textures are promises of realism without downloads.
export function textureSeed(name, w = 64, h = 64) { return { name, w, h, seed: [...name].reduce((a, c) => a + c.charCodeAt(0), 0) }; }
export const TEXTURES = Object.freeze(["mist", "lensDirt", "grass", "caustic", "cloud", "bark", "stone"].map(textureSeed));
