/**
 * B"H
 * Map factory vessels.
 *
 * Chapter 11: the Awtsmoos gives each arena its own scroll, but every scroll
 * shares the same grammar. Bounds, platforms, weapon altars, and power-up
 * constellations are declared as clean data so the world can grow without one
 * swollen file swallowing the sky.
 */
export const makeMap = ({ id, name, theme, hue, description, bounds, spawns, platforms, weaponSpawns, powerupSpawns = [] }) => ({
  id, name, theme, hue, description, bounds, spawns, platforms, weaponSpawns, powerupSpawns
});

export const bounds = (left, right, top = -1200, bottom = 1300) => ({ left, right, top, bottom });
export const point = (x, y) => ({ x, y });
export const platform = (x, y, w, h = 34, tag = 'stone') => ({ x, y, w, h, tag });
export const points = (...pairs) => pairs.map(([x, y]) => point(x, y));

/**
 * Builds wide ground pieces across an enormous arena.
 * @param {number} start Left coordinate.
 * @param {number} y Floor coordinate.
 * @param {number} count Slab count.
 * @returns {Array<object>} Platform slabs.
 */
export function lane(start, y, count) {
  return Array.from({ length: count }, (_, i) => platform(start + i * 860, y, 700 + (i % 2) * 120, 42));
}

/**
 * Builds floating step platforms for vertical combat.
 * @param {number} x First x.
 * @param {number} y First y.
 * @param {number} count Step count.
 * @returns {Array<object>} Floating platforms.
 */
export function steps(x, y, count) {
  return Array.from({ length: count }, (_, i) => platform(x + i * 540, y - (i % 3) * 115, 270 + (i % 2) * 70, 24, 'altar'));
}
