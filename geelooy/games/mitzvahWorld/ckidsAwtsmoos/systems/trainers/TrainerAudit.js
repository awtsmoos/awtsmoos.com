// B"H
/**
 * TrainerAudit
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { TRAINERS } from './TrainerRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function auditTrainers(){ return { ok:TRAINERS.every(t=>t.id&&t.ability), count:TRAINERS.length, trainers:TRAINERS.map(t=>t.id) }; }
export default auditTrainers;
