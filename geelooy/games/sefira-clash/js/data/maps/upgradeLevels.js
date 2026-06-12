/**
 * B"H
 * Global level upgrader with no ceilings and gapped vertical walls.
 *
 * Chapter 287: the heavens are fully open now. No lintel, no ceiling, no upper
 * cage. Side walls remain only as broken bouncy pillars with huge windows, so
 * fighters can ricochet without the whole map becoming a prison.
 */
export function upgradeLevel(map) {
  const rawWalls = map.walls?.length ? map.walls : autoSideWalls(map);
  const walls = rawWalls.flatMap(w => splitWallWithGaps(w, map)).filter(w => !isCeiling(w));
  const holes = map.holes || [];
  return {
    ...map,
    holes,
    walls,
    rules: {
      dangerMap: true,
      mostlySolid: true,
      openCeiling: true,
      noCeilings: true,
      wallBounce: walls.length > 0,
      ...(map.rules || {})
    }
  };
}

function autoSideWalls(map) {
  if (!map.bounds) return [];
  const { left, right, top, bottom } = map.bounds;
  const width = right - left;
  if (width < 1800) return [];
  const thick = 84;
  return [
    { x: left - thick, y: top, w: thick, h: bottom - top, tag: 'left-wall' },
    { x: right, y: top, w: thick, h: bottom - top, tag: 'right-wall' }
  ];
}

function splitWallWithGaps(w, map) {
  if (isCeiling(w)) return [];
  if (!isVerticalWall(w)) return [w];
  const top = map.bounds?.top ?? w.y;
  const bottom = map.bounds?.bottom ?? w.y + w.h;
  const height = bottom - top;
  const segments = [
    { y: top + height * 0.03, h: height * 0.18 },
    { y: top + height * 0.43, h: height * 0.17 },
    { y: top + height * 0.82, h: height * 0.15 }
  ];
  return segments.map((s, i) => ({ ...w, y: Math.round(s.y), h: Math.round(s.h), tag: `${w.tag || 'wall'}-gap-${i + 1}` }));
}

function isCeiling(w) {
  const tag = String(w.tag || '').toLowerCase();
  return tag.includes('ceiling') || tag.includes('lintel') || (w.w > w.h * 2.5 && w.y < -500);
}

function isVerticalWall(w) {
  return w.h > w.w * 2.2;
}
