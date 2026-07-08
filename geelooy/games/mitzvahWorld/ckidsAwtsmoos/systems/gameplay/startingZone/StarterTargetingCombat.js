// B"H
import { makeLootableCorpse, lootAll, lootPayload } from "../../loot/LootRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { openNpcInteraction } from "../../npc/NpcInteractionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { dist, face, facingDot, nowMs } from "./StarterMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function targetPayload(target) {
  if (!target) return { open:false };
  return {
    open:true,
    id:target.id,
    name:target.name,
    icon:target.icon || "🎯",
    friendly:Boolean(target.friendly),
    enemy:!target.friendly,
    door:target.type === "door",
    level:target.level || 1,
    hp:target.hp ?? null,
    maxHp:target.maxHp ?? null,
    healthPct:target.maxHp ? target.hp / target.maxHp : null,
    services:target.services || [],
    actions:target.friendly ? ["talk", ...(target.services || [])] : ["attack", "inspect"]
  };
}

export function createTargetingCombatSystem(ctx) {
  const { state, olam, events, clock } = ctx;

  function emit(name, payload) {
    olam.ayshPeula("ui event", name, payload);
    return payload;
  }

  function findTarget(id) {
    return [...olam.npcs, ...olam.enemies, ...olam.doors].find(x => x.id === id);
  }

  function selectTarget(id) {
    const target = findTarget(id);
    state.currentTarget = target || null;
    return emit("combatUnitFrames", {
      target:targetPayload(target),
      player:{ hp:olam.player.hp, maxHp:olam.player.maxHp, koach:olam.player.koach, maxKoach:olam.player.maxKoach }
    });
  }

  function validateAction(action, target) {
    if (!action) return { ok:false, reason:"unknown-action" };
    if (!target) return { ok:false, reason:"no-target" };
    const distance = dist(olam.player.position, target.position);
    if (Number(action.range || 0) && distance > Number(action.range || 0)) return { ok:false, reason:"too-far", distance };
    if (Number.isFinite(Number(action.facingDot)) && facingDot(olam.player, target) < Number(action.facingDot)) return { ok:false, reason:"must-face-target", distance, dot:facingDot(olam.player, target) };
    if (action.kind === "attack" && target.friendly) return { ok:false, reason:"friendly-target" };
    if (action.kind === "interact" && !target.friendly && target.type !== "door") return { ok:false, reason:"enemy-target" };
    if (target.dead && action.kind === "attack") return { ok:false, reason:"target-dead" };
    return { ok:true, distance };
  }

  function talkToTarget() {
    const action = state.actionBar.find(a => a.id === "talk_interact");
    const target = state.currentTarget;
    const valid = validateAction(action, target);
    if (!valid.ok) return emit("toast", { ok:false, reason:valid.reason });
    face(olam.player, target);
    if (target.type === "door") return emit("door", { ok:true, open:true, doorId:target.id, houseId:target.houseId, interiorId:target.opens, icon:target.icon });
    return emit("npcGossip", openNpcInteraction(olam, target.id));
  }

  function attackTarget(actionId = "melee_strike") {
    const action = state.actionBar.find(a => a.id === actionId);
    const target = state.currentTarget;
    const valid = validateAction(action, target);
    if (!valid.ok) return emit("combatLog", { ok:false, actionId, reason:valid.reason, distance:valid.distance });
    target.hp = Math.max(0, target.hp - action.damage);
    target.state = "combat";
    target.targetId = "player";
    target.lastAttackedAt = nowMs(clock);
    emit("floatingCombatText", { targetId:target.id, text:`-${action.damage}`, style:action.style, icon:action.icon, effect:action.effect });
    emit("nameplates", { plates:[targetPayload(target)] });
    if (target.hp <= 0) {
      target.dead = true;
      target.lootable = true;
      target.state = "dead";
      target.respawnAt = nowMs(clock) + target.respawnMs;
      const corpse = makeLootableCorpse(olam, target, { reason:"starter-mmo", actionId });
      target.corpseId = corpse.corpseId;
      return emit("combatLog", { ok:true, killed:true, targetId:target.id, corpseId:target.corpseId });
    }
    return emit("combatLog", { ok:true, killed:false, targetId:target.id, hp:target.hp });
  }

  function openLoot(corpseId = state.currentTarget?.corpseId) {
    return emit("loot", lootPayload(olam, corpseId));
  }

  function lootCorpse(corpseId = state.currentTarget?.corpseId) {
    return lootAll(olam, corpseId);
  }

  return { events, selectTarget, talkToTarget, attackTarget, openLoot, lootCorpse, validateAction, findTarget };
}
