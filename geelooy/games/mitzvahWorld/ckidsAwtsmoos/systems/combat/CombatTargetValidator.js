// B"H
import { classifyTarget, distance2D } from "../targeting/TargetClassifier.js";

export function validateCombatTarget(target, attacker = {}, options = {}) {
  if (!target) return fail("no-target");
  const meta = classifyTarget(target, { player:attacker, playerPosition:options.playerPosition });
  if (meta.dead) return fail("dead-target", meta);
  if (meta.friendly) return fail("friendly-target", meta);
  if (!meta.attackable) return fail("not-attackable", meta);
  const range = Number(options.range ?? options.weapon?.range ?? Infinity);
  const attackerPos = options.playerPosition || attacker?.position || attacker?.mesh?.position;
  const targetPos = target?.position || target?.mesh?.position;
  const distance = Number.isFinite(Number(options.distance)) ? Number(options.distance) : distance2D(attackerPos, targetPos);
  if (distance > range) return fail("out-of-range", { ...meta, distance, range });
  return { ok:true, reason:"valid-target", target, meta:{ ...meta, distance, range } };
}

function fail(reason, meta = null) {
  return { ok:false, reason, meta };
}

export default validateCombatTarget;
