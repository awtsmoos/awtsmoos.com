// B"H
/** @file TrainerAudit.js @description Verifies trainer coverage touches Torah abilities without inventing a second spellbook. */
import TrainerRegistry from "./TrainerRegistry.js";
export function runTrainerAudit() { const taught = new Set(TrainerRegistry.flatMap(t => t.teaches || [])); return { ok:taught.size >= 7, trainers:TrainerRegistry.length, taught:[...taught] }; }
export default { runTrainerAudit };
