// B"H
import { createAnimalState } from "../animals/RealisticAnimalFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createCorpse } from "../loot/CorpseLootRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { updateKillQuest } from "../quests/QuestState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { itemDefinition } from "../items/ItemDefinitions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function createCombatRuntime(ctx) {
  const cooldowns = new Map();
  const damageNumbers = [];
  const enemies = [
    createAnimalState("fox_1", "fox", "Garden Fox", 36, 62),
    createAnimalState("goat_1", "goat", "Bold Goat", 46, 64),
    createAnimalState("boar_1", "boar", "Bristle Boar", 56, 62),
    createAnimalState("guardian_1", "guardian_ram", "Guardian Ram", 66, 62)
  ];

  function selectEnemy(id) {
    const enemy = enemies.find(row => row.id === id && !row.dead) || enemies.find(row => !row.dead);
    if (!enemy) return { ok:false, reason:"no-live-enemy" };
    enemies.forEach(row => row.selected = false);
    enemy.selected = true;
    ctx.player.targetId = enemy.id;
    ctx.selectedEnemyId = enemy.id;
    return { ok:true, enemy:snapshotEnemy(enemy) };
  }

  function weaponMode(abilityId) {
    if (abilityId === "focus_shot" || ctx.player.equipment.weapon === "garden_bow") return "ranged";
    if (abilityId === "castStorm" || ctx.player.equipment.weapon === "learner_staff") return "magic";
    if (ctx.player.equipment.weapon === "walking_staff") return "staff";
    return "melee";
  }

  function statBonus(mode) {
    const stats = ctx.player.stats || {};
    const weapon = itemDefinition(ctx.player.equipment.weapon || "");
    const physical = weapon.physical || {};
    const scaled = (physical.scalesWith || []).reduce((sum, key) => sum + (Number(stats[key]) || 0) * .35, 0);
    if (mode === "ranged") return (Number(stats.dexterity) || 0) + (Number(stats.daas) || 0) * .3 + scaled;
    if (mode === "magic") return (Number(stats.faith) || 0) + (Number(stats.chochmah) || 0) * .35 + (Number(stats.binah) || 0) * .25 + scaled;
    if (mode === "staff") return (Number(stats.strength) || 0) * .65 + (Number(stats.wisdom) || 0) * .4 + scaled;
    return (Number(stats.strength) || 0) + (Number(stats.gevurah) || 0) * .25 + scaled;
  }

  function attack(abilityId = "melee_attack") {
    const enemy = enemies.find(row => row.id === ctx.selectedEnemyId && !row.dead);
    if (!enemy) return { ok:false, reason:"no-target" };
    const now = Date.now();
    const cdKey = abilityId;
    const readyAt = cooldowns.get(cdKey) || 0;
    if (readyAt > now) return { ok:false, reason:"cooldown", readyIn:readyAt - now };
    const mode = weaponMode(abilityId);
    const base = mode === "ranged" ? 16 : mode === "magic" ? 20 : mode === "staff" ? 17 : abilityId === "quick_strike" ? 18 : 14;
    const damage = Math.max(1, Math.round(base + statBonus(mode) - (enemy.elite ? 4 : 1)));
    enemy.hp = Math.max(0, enemy.hp - damage);
    enemy.effects += 1;
    damageNumbers.push({ targetId:enemy.id, damage, mode, at:now });
    cooldowns.set(cdKey, now + (mode === "ranged" ? 900 : 650));
    let retaliation = null;
    if (enemy.hp > 0) {
      const taken = Math.max(1, enemy.damage - (ctx.blocking ? 5 : 0));
      ctx.player.health = Math.max(0, ctx.player.health - taken);
      ctx.player.lastDamageTaken = taken;
      enemy.retaliations += 1;
      retaliation = { enemyId:enemy.id, damage:taken, playerHealth:ctx.player.health };
    }
    let corpse = null;
    let questUpdates = [];
    if (enemy.hp <= 0 && !enemy.dead) {
      enemy.dead = true;
      corpse = createCorpse(enemy);
      enemy.corpseId = corpse.id;
      ctx.corpses.push(corpse);
      questUpdates = updateKillQuest(ctx.questState, enemy.species);
    }
    return { ok:true, targetId:enemy.id, abilityId, mode, damage, hp:enemy.hp, killed:enemy.dead, effect:true, retaliation, corpse, questUpdates };
  }

  function spawnControlledEnemy(species = "fox") {
    const id = `${species}_${Date.now()}`;
    const enemy = createAnimalState(id, species, species.replace(/_/g, " "), 44, 60);
    enemies.push(enemy);
    return enemy;
  }

  function snapshotEnemy(enemy) {
    return {
      id:enemy.id,
      species:enemy.species,
      name:enemy.name,
      hp:enemy.hp,
      maxHp:enemy.maxHp,
      selected:enemy.selected,
      dead:enemy.dead,
      corpseId:enemy.corpseId,
      retaliations:enemy.retaliations,
      effects:enemy.effects
    };
  }

  return {
    enemies,
    damageNumbers,
    selectEnemy,
    attack,
    spawnControlledEnemy,
    snapshot:() => ({ enemies:enemies.map(snapshotEnemy), damageNumbers:damageNumbers.slice(-20), selectedEnemyId:ctx.selectedEnemyId })
  };
}
