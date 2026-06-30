// B"H
import { findGroundViolations, summarizeGround } from "./GroundViolationDetector.js";

export function validatePlayerGround(player, context = {}) {
  const violations = findGroundViolations([player], context);
  return { ok:violations.length === 0, violations };
}

export function validateAnimalGround(animals = [], context = {}) {
  const summary = summarizeGround(animals, context);
  return { ok:summary.violations.length === 0, ...summary };
}

export function validateLivingEntityGround(data = {}, context = {}) {
  const entities = [
    ...(data.npcs || []),
    ...(data.animals || []),
    ...(data.hostiles || [])
  ];
  const summary = summarizeGround(entities, context);
  return { ok:summary.violations.length === 0, ...summary };
}

export default { validatePlayerGround, validateAnimalGround, validateLivingEntityGround };
