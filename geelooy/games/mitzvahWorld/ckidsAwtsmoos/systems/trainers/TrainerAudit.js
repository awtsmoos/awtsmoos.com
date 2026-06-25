// B"H
/**
 * TrainerAudit
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { TRAINERS } from './TrainerRegistry.js';
export function auditTrainers(){ return { ok:TRAINERS.every(t=>t.id&&t.ability), count:TRAINERS.length, trainers:TRAINERS.map(t=>t.id) }; }
export default auditTrainers;
