// B"H
/**
 * @file VillageCombatManifest.js
 * @description
 * Chapter 701: A small meadow receives a real battle covenant.
 *
 * The Awtsmoos speaks a bounded encounter into the village: no endless flood,
 * no placeholder husks, only authored wildlife with health, names, rewards,
 * patrol centers, and a mission that can be completed before the lava gates.
 */

export const VILLAGE_COMBAT_MISSION = Object.freeze({
  id: "village_wild_sparks",
  title: "Guard the Village Meadow",
  biome: "Village",
  difficultyTier: "Training Grounds",
  missionText: "Wild sparks are circling the paths. Use the Hebrew-letter attack to refine them and earn travel rewards.",
  hintText: "Left click, the ATK dock button, or key V fires. Number keys 1-3 swap weapons.",
  targetKills: 5,
  completionReward: { xp: 80, perutas: 18 },
  objectives: [
    { label: "Equip a weapon with 1, 2, or 3", icon: "mezuzah", uiOrder: 1 },
    { label: "Fire Hebrew letters with V / ATK / left click", icon: "pushkuh", uiOrder: 2 },
    { label: "Refine wild village mobs", icon: "coin", uiOrder: 3, count: 5 }
  ]
});

export const VILLAGE_WILDLIFE = Object.freeze([
  { id: "fox_ember_01", name: "Ember Fox", species: "fox", position: { x: -24, y: 0.45, z: 19 }, color: 0xc4662e, accent: 0xffd36a, hp: 55, damage: 6, xp: 28, perutas: 4, speed: 4.1, aggro: 19, patrol: 9 },
  { id: "fox_ember_02", name: "Path Fox", species: "fox", position: { x: 31, y: 0.45, z: 7 }, color: 0xb85a28, accent: 0xffef9d, hp: 55, damage: 6, xp: 28, perutas: 4, speed: 4.0, aggro: 18, patrol: 8 },
  { id: "ram_briar_01", name: "Briar Ram", species: "ram", position: { x: -42, y: 0.58, z: 39 }, color: 0x7f6a4d, accent: 0xf3e0b0, hp: 88, damage: 10, xp: 42, perutas: 6, speed: 3.15, aggro: 17, patrol: 7 },
  { id: "ram_briar_02", name: "Hill Ram", species: "ram", position: { x: 56, y: 0.58, z: 42 }, color: 0x8b7657, accent: 0xffe0a8, hp: 92, damage: 11, xp: 44, perutas: 6, speed: 3.0, aggro: 17, patrol: 8 },
  { id: "stag_spark_01", name: "Spark Stag", species: "stag", position: { x: 7, y: 0.68, z: 55 }, color: 0x9a7244, accent: 0x9fffe0, hp: 120, damage: 14, xp: 60, perutas: 9, speed: 3.55, aggro: 22, patrol: 10 },
  { id: "wolf_shadow_01", name: "Shadow Wolf", species: "wolf", position: { x: 72, y: 0.5, z: -18 }, color: 0x4f5860, accent: 0xbce6ff, hp: 72, damage: 9, xp: 38, perutas: 5, speed: 4.5, aggro: 21, patrol: 10 },
  { id: "wolf_shadow_02", name: "Fence Wolf", species: "wolf", position: { x: -72, y: 0.5, z: -11 }, color: 0x59636b, accent: 0xd2f1ff, hp: 74, damage: 9, xp: 39, perutas: 5, speed: 4.45, aggro: 21, patrol: 10 }
]);

export const VILLAGE_BATTLE_DECOR = Object.freeze([
  { name: "training_banner_west", position: { x: -14, y: 1.8, z: 8 }, color: 0x7c2d12 },
  { name: "training_banner_east", position: { x: 18, y: 1.8, z: 11 }, color: 0x245c7c },
  { name: "reward_totem", position: { x: 4, y: 0.8, z: 20 }, color: 0xffd36a }
]);
