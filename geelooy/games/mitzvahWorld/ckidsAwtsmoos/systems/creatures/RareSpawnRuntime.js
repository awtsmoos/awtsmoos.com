// B"H
/** @file RareSpawnRuntime.js @description Rare spawns with announcements and solo-safe discovery payloads. */
import { announceRare } from "./RareAnnouncementRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const RareRegistry = Object.freeze([{ id:"golden_deer", name:"Golden Deer", species:"deer", chance:.02 }, { id:"white_fox", name:"White Fox", species:"fox", chance:.015 }, { id:"lost_traveler", name:"Lost Traveler", species:"npc", chance:.01 }]);
export function rollRare(seed = Math.random()) { let acc = 0; for (const r of RareRegistry) { acc += r.chance; if (seed <= acc) return r; } return null; }
export function spawnRare(olam, seed = Math.random()) { const rare = rollRare(seed); if (rare) announceRare(olam, rare); return rare; }
export default { RareRegistry, rollRare, spawnRare };
