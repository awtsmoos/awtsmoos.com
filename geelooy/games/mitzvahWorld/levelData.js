// B"H
/**
 * @file levelData.js
 * @description Chapter 59: level lookup returns JSON vessels, not imported code.
 */
async function loadJsonLevel(id) {
  const clean = String(id || "ladder-1.json").replace(/\.js$/i, ".json");
  const response = await fetch(new URL(`./levels/ladder/data/${clean}`, import.meta.url), { cache: "no-store" });
  if (!response.ok) throw new Error(`Level JSON not found: ${clean}`);
  return { default: await response.json() };
}

export const LEVEL_LIBRARY = Object.freeze(Object.fromEntries(
  Array.from({ length: 20 }, (_, index) => {
    const id = `ladder-${index + 1}.json`;
    return [id, () => loadJsonLevel(id)];
  })
));

export const ALL_LEVELS = LEVEL_LIBRARY;
export default LEVEL_LIBRARY;
