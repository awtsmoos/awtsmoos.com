/**
 * B"H
 * Global level upgrader.
 *
 * Chapter 241: every heichal receives the same modern laws: explicit holes,
 * safer walls when missing, a ceiling for bounce chambers, and stage danger
 * rules. The individual maps keep their soul; the wrapper gives them a body.
 */
export function upgradeLevel(map) {
  const walls = map.walls?.length ? map.walls : autoWalls(map);
  const holes = map.holes || [];
  return {
    ...map,
    holes,
    walls,
    rules: {
      dangerMap: true,
      mostlySolid: true,
      wallBounce: walls.length > 0,
      ...(map.rules || {})
    }
  };
}

function autoWalls(map) {
  if (!map.bounds) return [];
  const { left, right, top, bottom } = map.bounds;
  const width = right - left;
  if (width < 1800) return [];
  const thick = 84;
  return [
    { x: left - thick, y: top, w: thick, h: bottom - top, tag: 'left-wall' },
    { x: right, y: top, w: thick, h: bottom - top, tag: 'right-wall' },
    { x: left - thick, y: top - thick, w: width + thick * 2, h: thick, tag: 'ceiling' }
  ];
}
