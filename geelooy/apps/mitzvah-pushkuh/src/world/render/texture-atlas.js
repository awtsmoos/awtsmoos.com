// B"H
// Texture atlas is the paint box: all sprites share one prepared memory.
export function createTextureAtlas(source = {}) {
  const entries = new Map();
  function add(name, image) { entries.set(name, image); return image; }
  function get(name) { return entries.get(name) || source[name]; }
  function has(name) { return entries.has(name) || !!source[name]; }
  function names() { return [...entries.keys(), ...Object.keys(source)]; }
  return { add, get, has, names };
}
