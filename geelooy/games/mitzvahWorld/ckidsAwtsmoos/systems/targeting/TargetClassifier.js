// B"H
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const meshOf = e => e?.mesh || e?.object || null;
const rawOf = e => e && typeof e === "object" ? e : {};
const dataOf = e => ({ ...rawOf(e), ...(meshOf(e)?.userData || {}), ...(e?.userData || e?.data || {}) });
const posOf = e => e?.position || meshOf(e)?.position || (Number.isFinite(Number(e?.x)) ? { x:e.x, z:e.z ?? e.y } : { x:0, z:0 });
const speciesOf = e => dataOf(e).species || e?.def?.species || "target";
const nameOf = e => dataOf(e).displayName || dataOf(e).targetName || e?.name || meshOf(e)?.name || e?.id || "Target";

export function distance2D(a, b) {
  const ax = n(a?.x), az = n(a?.z ?? a?.y), bx = n(b?.x), bz = n(b?.z ?? b?.y);
  return Math.hypot(ax - bx, az - bz);
}

export function classifyTarget(entity, context = {}) {
  const data = dataOf(entity), pos = posOf(entity), player = context.playerPosition || context.player?.position || context.player?.mesh?.position;
  const wrapperCombat = Boolean(entity?.takeDamage || entity?.health || entity?.def);
  const kind = data.kind || data.targetKind || data.type || (data.isDoor || data.locked !== undefined || data.open !== undefined ? "door" : data.npc ? "npc" : data.species ? "animal" : wrapperCombat ? "creature" : "object");
  const friendly = Boolean(data.friendly || data.peaceful || data.domestic || data.nonCombat || kind === "npc");
  const hostile = Boolean(data.hostile || data.enemy || data.isEnemy || data.faction === "hostile" || (wrapperCombat && !friendly));
  const hp = entity?.hp ?? entity?.health?.current ?? data.hp ?? data.combatHp;
  const dead = Boolean(data.dead || entity?.isDead || (hp !== undefined && Number(hp) <= 0));
  const explicitAttackable = data.attackable || data.selectableCombatTarget || data.combatTargetProxy || wrapperCombat;
  const attackable = !dead && !friendly && Boolean(explicitAttackable || hostile);
  const interactionType = kind === "door" ? (data.locked ? "doorLocked" : "doorOpen") : attackable ? "combat" : friendly ? "talk" : data.interactionType || "inspect";
  const distance = player ? distance2D(pos, player) : n(context.distance, 0);
  return { id:String(data.id || entity?.id || entity?.uuid || nameOf(entity)), name:nameOf(entity), kind, species:speciesOf(entity), faction:data.faction || (hostile ? "hostile" : friendly ? "friendly" : "neutral"), hostile, friendly, attackable, dead, locked:Boolean(data.locked), distance, interactionType, valid:!dead };
}

export function nearestTarget(entities = [], context = {}) {
  let best = null, score = Infinity;
  for (const entity of entities) {
    const target = classifyTarget(entity, context);
    if (!target.valid) continue;
    const s = target.distance + (target.attackable ? -1 : 0);
    if (s < score) { best = target; score = s; }
  }
  return best;
}
