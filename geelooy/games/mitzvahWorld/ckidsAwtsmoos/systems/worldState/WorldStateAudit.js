// B"H
/**
 * WorldStateAudit
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { loadWorldState } from './WorldStateStore.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function auditWorldState(){ const s=loadWorldState(); return { ok:typeof s==='object', keys:Object.keys(s), updatedAt:s.updatedAt||0 }; }
export default auditWorldState;
