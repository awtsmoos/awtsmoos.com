// B"H
import { classifyTarget } from "./TargetClassifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function targetHudPayload(entity, context = {}) {
  if (!entity) return { selected:false, cleared:true };
  const target = entity.interactionType && entity.kind && entity.faction ? entity : classifyTarget(entity, context);
  const outOfRange = Number.isFinite(Number(context.range)) && target.distance > Number(context.range);
  return {
    selected:true,
    id:target.id,
    name:target.name,
    kind:target.kind,
    faction:target.faction,
    hostile:target.hostile,
    attackable:target.attackable,
    dead:target.dead,
    locked:target.locked,
    outOfRange,
    interactionType:target.interactionType,
    prompt:promptFor(target, outOfRange),
    health:context.health || null
  };
}

export function emitTargetHud(olam, entity, context = {}) {
  const payload = targetHudPayload(entity, context);
  olam?.ayshPeula?.("ui event", "targetHud", payload);
  return payload;
}

function promptFor(target, outOfRange) {
  if (target.dead) return "Defeated";
  if (outOfRange) return "Move closer";
  if (target.interactionType === "doorLocked") return "Locked";
  if (target.interactionType === "doorOpen") return "Enter";
  if (target.interactionType === "talk") return "Talk";
  if (target.attackable) return "Attack";
  return "Inspect";
}
