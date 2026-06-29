// B"H
/**
 * @typedef {Object} StarterEnemyArchetype
 * @property {string} species Shared species id. Same species uses one update loop.
 * @property {string} name Base display name.
 * @property {string} icon Emoji used by nameplates, loot cards, and target frames.
 * @property {number} hp Maximum health for level-one instances.
 * @property {"melee"|"ranged"} attackStyle Attack delivery used by the shared brain.
 * @property {number} attackRange Range where the enemy can deal damage.
 * @property {number} attackDamage Damage per successful attack.
 * @property {number} aggroRange Passive enemies use 0; hostile enemies auto-acquire.
 * @property {number} leashRange Distance from home before giving up.
 * @property {number} speed Meters per second at full update rate.
 * @property {number} respawnMs Corpse-to-live delay.
 * @property {ReadonlyArray<string>} loot Item ids emitted into corpse UI.
 * @property {"passive"|"idle-until-hit"|"chase"|"charge"|"kite"} pattern Shared state machine.
 * @property {ReadonlyArray<[number, number]>} path Normalized x/z patrol path offsets.
 * @property {number} brainHz Update cadence for this species before distance throttling.
 */

/**
 * Enemy and battle-animal archetypes.
 *
 * Dozens of actual instances point at these records. If two foxes are idle,
 * they run the same fox brain and the same patrol curve, only with an offset.
 * That keeps the world full without paying a bespoke AI cost for every animal.
 *
 * @type {Readonly<Record<string, StarterEnemyArchetype>>}
 */
export const STARTER_ENEMY_ARCHETYPES = Object.freeze({
  fox:Object.freeze({ species:"fox", name:"Forest Fox", icon:"🦊", hp:86, attackStyle:"melee", attackRange:2.5, attackDamage:9, aggroRange:15, leashRange:42, speed:6.8, respawnMs:9000, loot:["fur_scrap"], pattern:"charge", brainHz:12, path:[[0,0], [5,2], [2,7], [-4,4]] }),
  cow:Object.freeze({ species:"cow", name:"Field Cow", icon:"🐄", hp:140, attackStyle:"melee", attackRange:2.2, attackDamage:5, aggroRange:0, leashRange:28, speed:3.4, respawnMs:12000, loot:["cow_hide"], pattern:"idle-until-hit", brainHz:6, path:[[0,0], [3,1], [4,-2], [-1,-3]] }),
  wolf:Object.freeze({ species:"wolf", name:"Hill Wolf", icon:"🐺", hp:118, attackStyle:"melee", attackRange:2.7, attackDamage:13, aggroRange:19, leashRange:48, speed:7.2, respawnMs:11000, loot:["fur_scrap"], pattern:"chase", brainHz:14, path:[[0,0], [7,0], [8,6], [-3,5]] }),
  archer:Object.freeze({ species:"archer", name:"Road Bandit Archer", icon:"🏹", hp:96, attackStyle:"ranged", attackRange:24, attackDamage:10, aggroRange:23, leashRange:55, speed:4.8, respawnMs:14000, loot:["spark_fragment"], pattern:"kite", brainHz:10, path:[[0,0], [4,4], [-4,4], [-5,-2]] }),
  boar:Object.freeze({ species:"boar", name:"Brush Boar", icon:"🐗", hp:132, attackStyle:"melee", attackRange:2.8, attackDamage:12, aggroRange:17, leashRange:38, speed:8.0, respawnMs:10500, loot:["healing_herb"], pattern:"charge", brainHz:12, path:[[0,0], [6,-1], [3,5], [-5,3]] })
});

export default STARTER_ENEMY_ARCHETYPES;
