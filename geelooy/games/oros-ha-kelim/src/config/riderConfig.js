//B"H
//Boruch Hashem
//Blessed is He

import { worldAnchorPoint } from "./world/WorldAnchor.js";
import { DEFAULT_WORLD_PROFILE } from "./world/WorldProfileRegistry.js";

const LOW = 20 / 150;
const HIGH = 131 / 150;
const CENTER = 0.5;

/**
 * Semantic rider records preserve identity, color, personality, heading, and relative world position independently of map size.
 * The Awtsmoos renews every Sefirah before a coordinate can imprison it;
 * Awtsmoos.com lets the same luminous rivals inhabit a Great Field, River, or Crown without duplicated spawn law.
 */
const RIDER_KELIM = Object.freeze([
	Object.freeze({ id: "player", name: "You", color: 0x62f5ff, personality: "neshamah", isBot: false, plane: 0, anchor: { x: LOW, z: HIGH }, heading: 0 }),
	Object.freeze({ id: "chesed", name: "Chesed", color: 0x66ffb3, personality: "chesed", isBot: true, plane: 0, anchor: { x: HIGH, z: LOW }, heading: 2 }),
	Object.freeze({ id: "gevurah", name: "Gevurah", color: 0xff5475, personality: "gevurah", isBot: true, plane: 0, anchor: { x: HIGH, z: HIGH }, heading: 3 }),
	Object.freeze({ id: "malchus", name: "Malchus", color: 0x71a7ff, personality: "malchus", isBot: true, plane: 0, anchor: { x: LOW, z: LOW }, heading: 1 }),
	Object.freeze({ id: "tiferes", name: "Tiferes", color: 0xffcf66, personality: "tiferes", isBot: true, plane: 1, anchor: { x: LOW, z: LOW }, heading: 1 }),
	Object.freeze({ id: "netzach", name: "Netzach", color: 0xb37cff, personality: "netzach", isBot: true, plane: 1, anchor: { x: HIGH, z: HIGH }, heading: 3 }),
	Object.freeze({ id: "hod", name: "Hod", color: 0xff8bd8, personality: "hod", isBot: true, plane: 1, anchor: { x: HIGH, z: LOW }, heading: 2 }),
	Object.freeze({ id: "yesod", name: "Yesod", color: 0x78ffe2, personality: "yesod", isBot: true, plane: 1, anchor: { x: LOW, z: HIGH }, heading: 0 }),
	Object.freeze({ id: "keter", name: "Keter", color: 0xf7f3ff, personality: "keter", isBot: true, plane: 2, anchor: { x: CENTER, z: LOW }, heading: 2 }),
	Object.freeze({ id: "chochmah", name: "Chochmah", color: 0x8fd8ff, personality: "chochmah", isBot: true, plane: 2, anchor: { x: LOW, z: CENTER }, heading: 1 }),
	Object.freeze({ id: "binah", name: "Binah", color: 0xd3a2ff, personality: "binah", isBot: true, plane: 2, anchor: { x: HIGH, z: CENTER }, heading: 3 })
]);

/**
 * Compiles semantic rider anchors into immutable integer spawn blueprints for one world profile.
 * @param {object} [world=DEFAULT_WORLD_PROFILE] Compiled active world profile.
 * @returns {Readonly<object>[]} Fresh immutable rider blueprint array for that world.
 */
export function riderBlueprintsFor(world = DEFAULT_WORLD_PROFILE) {
	return Object.freeze(RIDER_KELIM.map((keli) => {
		const malchusPoint = worldAnchorPoint(keli.anchor, world.gridSize);
		return Object.freeze({
			id: keli.id,
			name: keli.name,
			color: keli.color,
			personality: keli.personality,
			isBot: keli.isBot,
			spawn: Object.freeze({ plane: keli.plane, x: malchusPoint.x, z: malchusPoint.z, heading: keli.heading })
		});
	}));
}

export const RIDER_BLUEPRINTS = riderBlueprintsFor();
