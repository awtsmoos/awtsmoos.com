// B"H
/** @file HouseColliderPairingRuntime.js @description Pairs visual houses to measured-shell collider records. */
export function pairHouseCollider(house, collider) {
  const record = { houseId: house?.userData?.houseId || house?.name, colliderId: collider?.userData?.colliderId || collider?.name, policy: "measuredShellCollider", at: Date.now(), ok: Boolean(house && collider) };
  if (house?.userData) house.userData.colliderPair = record;
  if (collider?.userData) collider.userData.visualTwin = record.houseId;
  return record;
}
export function pairingReport(pairs = []) { return { ok: pairs.every(p => p.ok), count: pairs.length, missing: pairs.filter(p => !p.ok) }; }
export default { pairHouseCollider, pairingReport };
