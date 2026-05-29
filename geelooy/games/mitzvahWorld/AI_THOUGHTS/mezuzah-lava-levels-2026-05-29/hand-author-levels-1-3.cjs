// B"H
/**
 * @file hand-author-levels-1-3.cjs
 * @description Chapter 65: not a generator of sameness. This is a scribe's
 * table: three explicit, handcrafted JSON vessels, each with its own rhythm,
 * trick, coin route, lava motion, pushkuh, and inside-right-post mezuzah.
 */
const fs = require("fs");
const path = require("path");
const out = path.join("geelooy", "games", "mitzvahWorld", "levels", "ladder", "data");
const coinMat = { guf: { CylinderGeometry: [0.42, 0.42, 0.1, 24] }, toyr: { MeshStandardMaterial: { color: 16766282, emissive: 11171584, metalness: 0.9, roughness: 0.2 } } };
const deep = value => JSON.parse(JSON.stringify(value));
const sky = name => ({ name, timeOfDay: 10, timeMultiplier: 0, position: { x: 0, y: 0, z: 0 } });
const terrain = name => ({ name, width: 120, depth: 70, thickness: 2.4, segments: 6, isSolid: false, textureType: "desert", position: { x: 18, y: -5.4, z: 0 } });
const player = (x, y, z) => ({ name: "The Chossid", height: 1.5, radius: 0.45, dynamicSolidRadius: 0.28, speed: 65, speedScale: 2, jumpHeight: 15, interactable: true, path: "https://models-3122d.web.app/chossid.glb?k=2", position: { x, y, z } });
const block = (name, x, y, z, width, depth, color = 0xd6b25e) => ({ name, width, height: 0.85, depth, color, textureSeed: name, position: { x, y, z }, safeRect: { x, z, width, depth } });
const pillar = (name, x, y, z, height, color = 0xdaa85a) => ({ name, width: 0.8, height, depth: 0.8, color, textureSeed: name, position: { x, y, z }, safeRect: { x, z, width: 0.8, depth: 0.8 } });
const coin = (name, x, y, z) => ({ name, value: 1, rotationSpeed: 0.03, position: { x, y, z }, golem: deep(coinMat) });
const lava = (name, minX, maxX, minZ, maxZ) => ({ name, groundY: -2.55, height: 0.46, pad: 0.04, lava: true, resetDelayMs: 3000, bounds: { minX, maxX, minZ, maxZ }, position: { x: (minX + maxX) / 2, y: -2.32, z: (minZ + maxZ) / 2 } });
const ball = (name, x, y, z, axis, amplitude, speed, radius = 0.62) => ({ name, axis, amplitude, speed, radius, hitRadius: radius * 0.7, position: { x, y, z } });
const mover = (name, x, y, z, axis, distance, speed, width = 2.6, depth = 1.75) => ({ name, width, height: 0.72, depth, axis, distance, speed, position: { x, y, z } });
const shatter = (name, x, y, z, width, depth, delay = 220) => ({ name, width, height: 0.72, depth, color: 0x8e6dff, textureSeed: name, proximity: 1.55, dropDelayMs: delay, shardCount: 22, position: { x, y, z }, safeRect: { x, z, width, depth } });
const vanish = (name, x, y, z, width, depth, vanishMs = 520) => ({ name, width, height: 0.72, depth, vanishMs, position: { x, y, z } });
const trapdoor = (name, x, y, z, width, depth, delayMs = 430) => ({ name, width, height: 0.72, depth, delayMs, position: { x, y, z } });
const pushBlock = (name, x, y, z, axis, amplitude, speed) => ({ name, axis, amplitude, speed, size: { x: 1.55, y: 1.05, z: 1.55 }, position: { x, y, z } });
const pushkuh = (name, x, y, z) => ({ name, requiresAllCoins: true, position: { x, y, z } });
const mezuzah = (next, x, y, z) => ({ name: "Inside Right Doorpost Mezuzah", label: "Inside Right Doorpost Mezuzah", next, destination: next, isSolid: false, interactable: true, proximity: 2.8, requiresAllCoins: true, requiresTzedakah: true, manualOnly: true, position: { x, y, z } });
const reset = name => ({ name, width: 110, height: 0.4, depth: 70, proximity: 7, penalty: 0, color: 0x330000, resetDelayMs: 3000, position: { x: 20, y: -13.5, z: 0 } });
const base = (id, title, required, next, nivrayim) => ({ format: "awtsmoos-level-json-v1", id, shaym: title.replace(/\s+/g, "_"), title, requiredPerutos: required, nextLevel: next, globalCoinStorageKey: "awtsmoosMitzvahGlobalCoins", nivrayim });
const level1 = base("ladder-1.json", "Aleph Sparks Over Lava", 7, "ladder-2.json", {
  ProceduralSky: [sky("aleph_sparks_sky")],
  ProceduralTerrain: [terrain("low_sand_seen_below_lava")],
  Chossid: [player(-8, 4.8, 0)],
  SolidBlock: [
    block("wide_start_island", -8, 0, 0, 7.5, 5.5),
    block("tiny_step_one", -1.8, 0.75, -1.15, 2.1, 1.65),
    block("tiny_step_two", 2.4, 1.45, 1.25, 1.8, 1.5),
    block("coin_perch_before_mover", 6.5, 2.2, -1.35, 2.15, 1.55),
    block("gate_island_with_right_post", 25.5, 4.8, 0, 7.2, 5.4, 0xe1bd65),
    pillar("left_gate_post", 27.7, 7, -2.2, 4.2),
    pillar("right_gate_post", 27.7, 7, 2.2, 4.2),
    block("gate_lintel", 27.7, 9.25, 0, 0.9, 4.9, 0xeac86e)
  ],
  MovingPlatform: [mover("first_moving_lava_lab", 10.9, 2.85, 1.1, "z", 3.1, 0.92, 2.4, 1.55)],
  BetrayalPlatform: [shatter("first_cracking_coin_slab", 15.1, 3.55, -1.2, 2.45, 1.7, 260)],
  DisappearingPlatform: [vanish("blink_before_gate", 19.2, 4.15, 1.15, 2.2, 1.55, 560)],
  SpikeField: [lava("main_aleph_lava_sea", -16, 34, -16, 16)],
  SpikedBallHazard: [
    ball("slow_lava_ball_teaches_waiting", 4.2, 2.5, 0.1, "z", 1.45, 0.72),
    ball("gate_guard_lava_ball", 21.8, 5.35, -0.9, "x", 1.35, 0.82)
  ],
  Coin: [
    coin("aleph_coin_start", -5.8, 1.55, 1.5),
    coin("aleph_coin_tiny_one", -1.8, 2.25, -1.15),
    coin("aleph_coin_tiny_two", 2.4, 2.9, 1.25),
    coin("aleph_coin_perch", 6.5, 3.65, -1.35),
    coin("aleph_coin_mover", 10.9, 4.25, 1.1),
    coin("aleph_coin_shatter_bait", 15.1, 4.95, -1.2),
    coin("aleph_coin_gate", 23.2, 6.25, 1.4)
  ],
  TzedakahBox: [pushkuh("pushkuh_on_gate_island_level_1", 24.4, 5.45, 1.7)],
  InteractiveDoor: [mezuzah("ladder-2.json", 28.15, 7.35, 2.25)],
  FallResetTrigger: [reset("deep_reset_level_1")]
});
const level2 = base("ladder-2.json", "Beis Timing and False Gold", 9, "ladder-3.json", {
  ProceduralSky: [sky("beis_timing_sky")],
  ProceduralTerrain: [terrain("beis_basin_below")],
  Chossid: [player(-9, 5.2, -1.2)],
  SolidBlock: [
    block("beis_start_narrow", -9, 0, -1.2, 6.4, 4.4),
    block("left_choice_safe", -3.8, 0.85, 1.7, 1.85, 1.45),
    block("right_choice_coin", 0.4, 1.55, -1.8, 1.65, 1.35),
    block("timing_rest_stone", 8.9, 2.75, 0, 2.35, 1.7),
    block("narrow_gate_approach", 24.8, 5.1, -0.7, 3.1, 1.8),
    block("beis_gate_island", 31.2, 5.85, 0, 7.8, 5.3, 0xe1bd65),
    pillar("beis_left_post", 33.7, 8.05, -2.1, 4.4),
    pillar("beis_right_post", 33.7, 8.05, 2.1, 4.4),
    block("beis_gate_lintel", 33.7, 10.35, 0, 0.9, 4.8, 0xeac86e)
  ],
  MovingPlatform: [
    mover("beis_long_moving_lab_bridge", 4.4, 2.05, 1.4, "x", 3.8, 1.02, 2.35, 1.4),
    mover("beis_return_mover_over_fire", 17.1, 4.1, -1.2, "z", 3.4, 1.12, 2.15, 1.35)
  ],
  BetrayalPlatform: [shatter("beis_pretty_platform_that_lies", 12.9, 3.35, 1.6, 2.25, 1.55, 210)],
  TrapdoorPlatform: [trapdoor("beis_trapdoor_after_lie", 20.8, 4.72, 1.35, 2.3, 1.5, 390)],
  SlipperyPlatform: [{ name: "beis_slippery_coin_shelf", width: 2.45, height: 0.72, depth: 1.5, axis: "x", slidePower: 8.2, position: { x: 27.2, y: 5.45, z: -1.3 } }],
  SpikeField: [lava("beis_lava_with_two_lanes", -17, 40, -17, 17)],
  SpikedBallHazard: [
    ball("beis_sweeper_at_choice", -1.7, 2.25, 0.3, "z", 2.0, 0.94),
    ball("beis_middle_lava_lab", 10.2, 4.25, 0.2, "x", 2.0, 1.05),
    ball("beis_gate_sentinel", 28.2, 6.6, 0.1, "z", 1.75, 1.12)
  ],
  MovingPushBlock: [pushBlock("beis_push_block_forces_jump", 22.9, 5.75, -0.1, "z", 1.55, 1.04)],
  CoinMimicHazard: [{ name: "beis_fake_coin_teaches_suspicion", penalty: 5, radius: 0.85, height: 1.2, position: { x: 13, y: 4.65, z: 1.6 } }],
  Coin: [
    coin("beis_coin_start_left", -8.4, 1.55, 0.9),
    coin("beis_coin_choice_left", -3.8, 2.3, 1.7),
    coin("beis_coin_choice_right", 0.4, 3.0, -1.8),
    coin("beis_coin_on_mover", 4.4, 3.45, 1.4),
    coin("beis_coin_rest", 8.9, 4.1, 0),
    coin("beis_coin_after_false_gold", 16.9, 5.35, -1.2),
    coin("beis_coin_trapdoor", 20.8, 6.05, 1.35),
    coin("beis_coin_slippery", 27.2, 6.8, -1.3),
    coin("beis_coin_gate", 30.4, 7.25, 1.45)
  ],
  TzedakahBox: [pushkuh("pushkuh_on_gate_island_level_2", 30.1, 6.5, 1.65)],
  InteractiveDoor: [mezuzah("ladder-3.json", 34.15, 8.45, 2.15)],
  FallResetTrigger: [reset("deep_reset_level_2")]
});
const level3 = base("ladder-3.json", "Gimmel Shattered Bridge", 11, "ladder-4.json", {
  ProceduralSky: [sky("gimmel_shattered_bridge_sky")],
  ProceduralTerrain: [terrain("gimmel_black_sand_below")],
  Chossid: [player(-10, 5.4, 0)],
  SolidBlock: [
    block("gimmel_start_island", -10, 0, 0, 6.8, 4.8),
    block("bridge_anchor_one", -3.8, 0.85, -1.2, 1.7, 1.35),
    block("bridge_anchor_two", 2.4, 1.75, 1.35, 1.65, 1.3),
    block("high_safe_breath", 15.2, 4.45, 0, 2.4, 1.7),
    block("after_push_safe_to_gate", 28.9, 6.05, -1.2, 3.2, 1.8),
    block("gimmel_gate_island", 37.2, 6.85, 0, 8, 5.6, 0xe1bd65),
    pillar("gimmel_left_post", 39.8, 9.15, -2.25, 4.6),
    pillar("gimmel_right_post", 39.8, 9.15, 2.25, 4.6),
    block("gimmel_gate_lintel", 39.8, 11.55, 0, 0.9, 5, 0xeac86e)
  ],
  BetrayalPlatform: [
    shatter("gimmel_bridge_piece_one", 6.2, 2.45, -1.2, 1.75, 1.25, 240),
    shatter("gimmel_bridge_piece_two", 8.9, 3.05, 0.85, 1.65, 1.2, 220),
    shatter("gimmel_bridge_piece_three", 11.6, 3.65, -0.9, 1.55, 1.2, 200),
    shatter("gimmel_last_false_step", 24.3, 5.55, 1.35, 2.05, 1.35, 180)
  ],
  MovingPlatform: [
    mover("gimmel_side_mover_first_rescue", 18.8, 4.95, 1.4, "z", 3.5, 1.18, 2.1, 1.3),
    mover("gimmel_final_mover_to_gate", 32.5, 6.35, 1.1, "x", 2.7, 1.08, 2.25, 1.4)
  ],
  DisappearingPlatform: [vanish("gimmel_blink_above_letters", 21.3, 5.25, -1.45, 2.0, 1.25, 430)],
  TrapdoorPlatform: [trapdoor("gimmel_gate_trapdoor_choice", 34.6, 6.65, -1.65, 2.1, 1.35, 360)],
  SpikeField: [lava("gimmel_deep_letter_lava", -19, 47, -18, 18)],
  SpikedBallHazard: [
    ball("gimmel_orb_under_bridge_one", 5.7, 3.4, 0.1, "z", 2.15, 1.08),
    ball("gimmel_orb_under_bridge_two", 13.6, 5.0, -0.1, "x", 2.0, 1.14),
    ball("gimmel_orb_push_corridor", 25.8, 7.05, 0, "z", 2.1, 1.22),
    ball("gimmel_gate_orb", 35.8, 8.1, 0.8, "x", 1.75, 1.05)
  ],
  MovingPushBlock: [
    pushBlock("gimmel_push_wall_first", 23.1, 6.25, -0.2, "z", 1.85, 1.12),
    pushBlock("gimmel_push_wall_second", 30.6, 7.25, 0.4, "x", 1.65, 1.0)
  ],
  Coin: [
    coin("gimmel_coin_start", -10.8, 1.55, 1.2),
    coin("gimmel_coin_anchor_one", -3.8, 2.25, -1.2),
    coin("gimmel_coin_anchor_two", 2.4, 3.15, 1.35),
    coin("gimmel_coin_bridge_one", 6.2, 3.9, -1.2),
    coin("gimmel_coin_bridge_two", 8.9, 4.45, 0.85),
    coin("gimmel_coin_bridge_three", 11.6, 5.1, -0.9),
    coin("gimmel_coin_safe_breath", 15.2, 5.9, 0),
    coin("gimmel_coin_side_mover", 18.8, 6.3, 1.4),
    coin("gimmel_coin_blink", 21.3, 6.6, -1.45),
    coin("gimmel_coin_after_push", 28.9, 7.45, -1.2),
    coin("gimmel_coin_gate", 36.1, 8.3, 1.4)
  ],
  TzedakahBox: [pushkuh("pushkuh_on_gate_island_level_3", 36.05, 7.5, 1.75)],
  InteractiveDoor: [mezuzah("ladder-4.json", 40.25, 9.6, 2.3)],
  FallResetTrigger: [reset("deep_reset_level_3")]
});
for (const level of [level1, level2, level3]) fs.writeFileSync(path.join(out, level.id), JSON.stringify(level, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, authored: [level1.id, level2.id, level3.id] }, null, 2));
