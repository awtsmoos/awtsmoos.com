// B"H
import { STARTER_ENEMY_ARCHETYPES } from "./StarterEnemyArchetypes.js";
import { TAU, dist, face, nowMs, vec } from "./StarterMath.js";

function patrolPoint(enemy, archetype, t) {
  const path = archetype.path || [[0, 0]];
  const phase = ((t + enemy.timeOffset) / 1200) % path.length;
  const a = path[Math.floor(phase) % path.length];
  const b = path[(Math.floor(phase) + 1) % path.length];
  const mix = phase % 1;
  return {
    x:enemy.home.x + a[0] + (b[0] - a[0]) * mix,
    z:enemy.home.z + a[1] + (b[1] - a[1]) * mix
  };
}

function moveToward(enemy, point, speed, dtMs) {
  face(enemy, { position:point });
  const d = dist(enemy.position, point);
  const step = Math.min(d, speed * (dtMs / 1000));
  enemy.position.x += Math.sin(enemy.yaw) * step;
  enemy.position.z += Math.cos(enemy.yaw) * step;
  return d;
}

/**
 * Shared enemy-brain scheduler.
 *
 * Every animal still has its own position and health, but the behavior loop is
 * grouped by archetype. Idle foxes are one fox algorithm with offsets; cows are
 * one cow algorithm with offsets. Distance rules then decide whether the loop
 * runs now, sleeps, or becomes a low-frequency impostor update.
 */
export function createCreatureBrain(ctx) {
  const { state, olam, clock } = ctx;

  function tickSpecies(species, enemies, dtMs, t) {
    const archetype = STARTER_ENEMY_ARCHETYPES[species];
    let active = 0;
    let sleeping = 0;
    let impostor = 0;
    for (const enemy of enemies) {
      if (enemy.dead) {
        if (enemy.respawnAt && t >= enemy.respawnAt) {
          enemy.dead = false;
          enemy.lootable = false;
          enemy.corpseId = null;
          enemy.hp = enemy.maxHp;
          enemy.state = archetype.pattern === "idle-until-hit" ? "idle" : "wander";
          enemy.position = vec(enemy.home.x, enemy.home.z);
          enemy.mesh.visible = true;
          olam.ayshPeula("ui event", "spawn", { id:enemy.id, respawned:true });
        }
        continue;
      }

      const playerDistance = dist(enemy.position, olam.player.position);
      const inCombat = enemy.targetId === "player" || enemy.lastAttackedAt;
      const hostileWake = archetype.aggroRange > 0 && playerDistance <= archetype.aggroRange;
      const nearEnough = playerDistance <= state.frameBudget.updateBubble;

      if (!nearEnough && !inCombat) {
        enemy.state = playerDistance <= state.frameBudget.visibleBubble ? "impostor" : "sleep";
        if (enemy.state === "sleep") sleeping++; else impostor++;
        continue;
      }

      const minStep = 1000 / Math.max(1, archetype.brainHz || 10);
      if (!inCombat && enemy.lastBrainAt && t - enemy.lastBrainAt < minStep) {
        impostor++;
        continue;
      }
      enemy.lastBrainAt = t;

      if (hostileWake || inCombat) {
        active++;
        enemy.targetId = "player";
        const homeDistance = dist(enemy.position, enemy.home);
        if (homeDistance > archetype.leashRange) {
          enemy.state = "leash";
          enemy.targetId = null;
          enemy.lastAttackedAt = 0;
          moveToward(enemy, enemy.home, archetype.speed * 1.15, dtMs);
          continue;
        }

        if (playerDistance > enemy.attackRange) {
          enemy.state = archetype.pattern === "charge" ? "charge" : archetype.pattern === "kite" ? "kite" : "chase";
          const destination = archetype.pattern === "kite" && playerDistance < enemy.attackRange * 0.6 ? enemy.home : olam.player.position;
          moveToward(enemy, destination, archetype.speed, dtMs);
        } else if (t >= enemy.nextAttackAt) {
          enemy.state = "attack";
          enemy.nextAttackAt = t + (enemy.attackStyle === "ranged" ? 1300 : 950);
          olam.player.hp = Math.max(0, olam.player.hp - enemy.attackDamage);
          olam.ayshPeula("ui event", "combatLog", { enemyId:enemy.id, icon:enemy.icon, action:enemy.attackStyle, damage:enemy.attackDamage, playerHp:olam.player.hp });
        }
        continue;
      }

      enemy.state = archetype.pattern === "idle-until-hit" ? "idle" : "wander";
      const p = patrolPoint(enemy, archetype, t);
      moveToward(enemy, p, archetype.speed * 0.35, dtMs);
      enemy.yaw = (enemy.yaw + 0.0007 * dtMs) % TAU;
      active++;
    }
    return { species, active, sleeping, impostor };
  }

  function enemyTick(dtMs = 16.67) {
    const t = nowMs(clock);
    const bySpecies = new Map();
    let activeSlots = 0;
    const maxActive = Math.max(1, Number(state.frameBudget.maxActiveEnemies || 18));
    const sortedEnemies = olam.enemies.slice().sort((a, b) => {
      const ac = a.targetId === "player" || a.lastAttackedAt ? 0 : 1;
      const bc = b.targetId === "player" || b.lastAttackedAt ? 0 : 1;
      return ac - bc || dist(a.position, olam.player.position) - dist(b.position, olam.player.position);
    });
    for (const enemy of sortedEnemies) {
      if (!enemy.dead && dist(enemy.position, olam.player.position) <= state.frameBudget.updateBubble) {
        if (activeSlots >= maxActive && enemy.targetId !== "player") {
          enemy.state = "throttled";
          continue;
        }
        if (activeSlots >= maxActive && enemy.targetId === "player" && !enemy.lastAttackedAt) {
          enemy.state = "combat-throttled";
          continue;
        }
        activeSlots += 1;
      }
      if (!bySpecies.has(enemy.species)) bySpecies.set(enemy.species, []);
      bySpecies.get(enemy.species).push(enemy);
    }
    const species = [...bySpecies].map(([key, rows]) => tickSpecies(key, rows, dtMs, t));
    return {
      species,
      active:species.reduce((sum, row) => sum + row.active, 0),
      sleeping:species.reduce((sum, row) => sum + row.sleeping, 0),
      impostor:species.reduce((sum, row) => sum + row.impostor, 0),
      sharedLoops:species.length,
      playerHp:olam.player.hp
    };
  }

  return { enemyTick };
}
