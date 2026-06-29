// B"H
import { STARTER_ACTION_BAR } from "./StarterActionBarData.js";
import { STARTER_ENEMY_ARCHETYPES } from "./StarterEnemyArchetypes.js";
import { STARTER_SUBZONES } from "./StarterSubzoneData.js";
import { clone, deterministicOffset, vec } from "./StarterMath.js";

function meshLike(entity, extra = {}) {
  return {
    visible:true,
    position:entity.position,
    userData:{ displayName:entity.name, ...extra }
  };
}

export function makePlayer() {
  const player = {
    id:"player",
    name:"Chossid",
    icon:"🧍",
    level:8,
    hp:124,
    maxHp:124,
    koach:110,
    maxKoach:110,
    perutah:220,
    position:vec(0, 0),
    yaw:0,
    inventory:{ slots:[], actionSlots:clone(STARTER_ACTION_BAR), equipment:{} },
    mesh:{ position:vec(0, 0), rotation:{ y:0 } }
  };
  return player;
}

export function makeOlam(events = []) {
  const player = makePlayer();
  return {
    player,
    chossid:player,
    npcs:[],
    enemies:[],
    roads:[],
    houses:[],
    doors:[],
    forest:[],
    events,
    ayshPeula:(kind, name, payload) => events.push({ kind, name, payload })
  };
}

export function makeNpc(row, index, subzone) {
  const offset = deterministicOffset(index + row.role.length, 9);
  const x = subzone.bounds.x - 18 + (index % 8) * 5 + offset.x * 0.2;
  const z = subzone.bounds.z - 8 + Math.floor(index / 8) * 5 + offset.z * 0.2;
  return {
    id:`${row.role}_${subzone.id}_${index}`,
    name:`${row.role.replace(/_/g, " ")} ${index + 1}`,
    icon:row.role === "vendor" ? "🛒" : row.role === "trainer" ? "📚" : row.role === "guard" ? "🛡️" : "💬",
    friendly:true,
    role:row.role,
    subzoneId:subzone.id,
    position:vec(x, z),
    services:[...(row.services || ["gossip"])],
    level:1 + (index % 5),
    pathOffset:(index * 137) % 1000,
    brainKey:`friendly:${row.role}`
  };
}

export function makeEnemy(species, index, subzone, center, spread = 20) {
  const base = STARTER_ENEMY_ARCHETYPES[species] || STARTER_ENEMY_ARCHETYPES.fox;
  const offset = deterministicOffset(index + species.length * 31, spread);
  const enemy = {
    id:`${species}_${subzone.id}_${index}`,
    name:`${base.name} ${index + 1}`,
    icon:base.icon,
    species,
    archetypeId:species,
    level:1 + (index % 4),
    subzoneId:subzone.id,
    position:vec(center.x + offset.x, center.z + offset.z),
    home:vec(center.x + offset.x, center.z + offset.z),
    yaw:0,
    hp:base.hp,
    maxHp:base.hp,
    state:base.pattern === "idle-until-hit" ? "idle" : "wander",
    targetId:null,
    dead:false,
    lootable:false,
    corpseId:null,
    respawnAt:0,
    nextAttackAt:0,
    lastBrainAt:0,
    timeOffset:(index * 173) % 5000,
    pattern:base.pattern,
    attackStyle:base.attackStyle,
    attackRange:base.attackRange,
    attackDamage:base.attackDamage,
    aggroRange:base.aggroRange,
    leashRange:base.leashRange,
    speed:base.speed,
    respawnMs:base.respawnMs,
    loot:[...base.loot],
    brainKey:`enemy:${species}`
  };
  enemy.mesh = meshLike(enemy, { species, isEnemy:true, lodSource:"starter-zone-archetype" });
  enemy.health = { get current() { return enemy.hp; }, set current(v) { enemy.hp = Math.max(0, Number(v) || 0); }, get max() { return enemy.maxHp; } };
  enemy.takeDamage = amount => {
    enemy.hp = Math.max(0, enemy.hp - Math.max(0, Number(amount) || 0));
    if (enemy.hp <= 0) enemy.dead = true;
    return amount;
  };
  return enemy;
}

export function addDenseEnemyPack(olam, options = {}) {
  const count = Math.max(0, Number(options.count || 0) | 0);
  const speciesRows = options.species || ["fox", "wolf", "boar", "archer", "cow"];
  const center = options.center || olam?.player?.position || { x:0, z:0 };
  const spread = Number(options.spread || 24);
  const subzone = { id:options.subzoneId || "stress_yard", bounds:{ x:center.x || 0, z:center.z || 0, radius:spread + 10 } };
  const start = olam.enemies.length;
  for (let i = 0; i < count; i++) {
    const enemy = makeEnemy(speciesRows[i % speciesRows.length], start + i, subzone, center, spread);
    if (options.hostile !== false) enemy.targetId = "player";
    olam.enemies.push(enemy);
  }
  return olam.enemies.slice(start);
}

export function instantiateSubzoneWorld(olam, npcIndex) {
  let enemyIndex = 0;
  for (const subzone of STARTER_SUBZONES) {
    olam.roads.push(...subzone.roads.map(road => ({ ...road, subzoneId:subzone.id, collider:"static-road-bounds" })));
    olam.houses.push(...subzone.houses.map(house => ({ ...house, icon:"🏠", collider:"static-house-bounds", procedural:true })));
    olam.doors.push(...subzone.doors.map(door => ({ ...door, friendly:true, type:"door", name:`Door to ${door.houseId}`, services:["open"], collider:"interactive-door" })));
    olam.forest.push(...subzone.forest.map(row => ({ ...row, subzoneId:subzone.id, renderer:"instanced-lod" })));
    for (const row of subzone.population) {
      for (let i = 0; i < row.count; i++) olam.npcs.push(makeNpc(row, npcIndex++, subzone));
    }
    for (const row of subzone.encounters) {
      for (let i = 0; i < row.count; i++) olam.enemies.push(makeEnemy(row.species, enemyIndex++, subzone, row.center, row.spread));
    }
  }
  return olam;
}
