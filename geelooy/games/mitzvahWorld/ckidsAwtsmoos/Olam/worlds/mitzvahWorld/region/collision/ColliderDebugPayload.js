// B"H
/**
 * @file ColliderDebugPayload.js
 * @description The hidden wall becomes a readable scroll: recent collisions,
 * house-specific hits, and source counts are exposed without runtime scans.
 */
function categoryCounts(records = []) {
  return records.reduce((map, record) => {
    const key = record.category || record.kind || "unknown";
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});
}

function lastOf(list = []) { return list.length ? list[list.length - 1] : null; }

export function colliderDebugPayload(olam, records = []) {
  const allHistory = olam?.__collisionLog || olam?.__wallHitHistory || [];
  const wallHistory = olam?.__wallHitHistory || [];
  const houseHistory = olam?.__houseCollisionLog || [];
  const lastCollision = olam?.__lastCollision || lastOf(allHistory) || null;
  const lastWall = olam?.__lastInvisibleWallHit || lastOf(wallHistory) || lastCollision;
  const lastHouse = olam?.__lastHouseCollision || lastOf(houseHistory) || null;
  return {
    last: lastWall,
    lastCollision,
    lastHouse,
    recent: wallHistory.slice(-8),
    recentCollisions: allHistory.slice(-12),
    recentHouse: houseHistory.slice(-12),
    sourceCount: records.length,
    categories: categoryCounts(records),
    houseHitsBuffered: houseHistory.length,
    wallHitsBuffered: wallHistory.length,
    collisionHitsBuffered: allHistory.length
  };
}

export default colliderDebugPayload;
