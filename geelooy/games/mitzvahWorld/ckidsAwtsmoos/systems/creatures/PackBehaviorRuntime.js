// B"H
/** @file PackBehaviorRuntime.js @description Pack links, assist calls, and compact camp payloads. */
import { callForHelp } from "./SocialAggroRuntime.js";
export function assignPack(creature, packId) { creature.__packId = packId; creature.mesh && (creature.mesh.userData.packId = packId); return packId; }
export function packMembers(creatures = [], packId) { return creatures.filter(c => c.__packId === packId || c?.mesh?.userData?.packId === packId); }
export function alertPack(creature, creatures = [], sourceId = "player") { const packId = creature.__packId || creature?.mesh?.userData?.packId; const members = packMembers(creatures, packId); const social = callForHelp(creature, members, sourceId); return { packId, alerted:social.length }; }
export function packPayload(creatures = []) { const groups = {}; for (const c of creatures) { const id = c.__packId || c?.mesh?.userData?.packId || "solo"; groups[id] ||= 0; groups[id]++; } return groups; }
export default { assignPack, packMembers, alertPack, packPayload };
