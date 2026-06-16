// B"H
/**
 * @file ParcelOwnership.js
 * @description Owner records for village parcels. The house is not anonymous:
 * it has a keeper, a story, a gate, a door, and a field where duty grows.
 */
export const OWNER_ROLES = Object.freeze([
  "farmer", "baker", "shepherd", "scribe", "melamed", "sofer", "grocer",
  "kohenTeacher", "leviTeacher", "poorFamily", "innkeeper", "toolmaker",
  "orchardKeeper", "beekeeper"
]);
export function ownerId(role, index = 1) { return `${role}_${String(index).padStart(2, "0")}`; }
export function ownerRecord(role, index = 1) {
  const words = role.replace(/[A-Z]/g, m => ` ${m}`).replace(/^./, c => c.toUpperCase());
  return { id: ownerId(role, index), role, displayName: words, npcId: ownerId(role, index) };
}
export default { OWNER_ROLES, ownerId, ownerRecord };
