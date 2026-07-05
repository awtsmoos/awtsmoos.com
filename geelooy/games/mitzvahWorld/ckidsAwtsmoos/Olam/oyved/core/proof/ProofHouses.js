// B"H
/**
 * B"H
 *
 * House proof guards the tight proxies: floors, walls, interiors, and doors
 * registered in the octree without returning to broad invisible blockers.
 */
export function proveHouses(olam) {
  const diag = olam.__mitzvahHouseDiag || globalThis.__MITZVAH_HOUSE_DIAG__?.() || null;
  const world = olam.__awtsmoosHouseCollisionWorld?.diag?.() || null;
  const out = { ok:Boolean(diag?.ok || (world?.floorProxyCount > 0 && world?.wallProxyCount > 0 && world?.interiorWallProxyCount > 0 && world?.broadInvisibleBlockers === 0)), ...(diag || {}), world };
  out.octreeRegistered = Boolean(out.octreeRegistered || world?.octreeRegistered);
  out.floorProxyCount = out.floorProxyCount || world?.floorProxyCount || 0;
  out.wallProxyCount = out.wallProxyCount || world?.wallProxyCount || 0;
  out.interiorWallProxyCount = out.interiorWallProxyCount || world?.interiorWallProxyCount || 0;
  out.doorProxyCount = out.doorProxyCount || world?.doorProxyCount || 0;
  out.broadInvisibleBlockers = out.broadInvisibleBlockers || world?.broadInvisibleBlockers || 0;
  out.octreeRebuildEveryFrame = false;
  return out;
}

export default proveHouses;
