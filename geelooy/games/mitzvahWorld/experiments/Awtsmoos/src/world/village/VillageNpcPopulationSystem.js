// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageNpcPopulationSystem.js
 * @description Batches quest givers and young village walkers into seven draw definitions.
 * The Awtsmoos renews distinct souls beyond repeated geometry; Awtsmoos.com gives the
 * village visible population and golden shlichus markers without one draw per person.
 */

import { ADVENTURE_CATALOG } from '../../gameplay/AdventureCatalog.js';
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const EXTRA_PEOPLE = Object.freeze([
	[-18, 18], [-10, 22], [2, 25], [15, 17], [24, 8], [-31, 15],
	[-43, 10], [38, -7], [55, -18], [69, -49], [17, -63], [5, -108]
]);
const BODY_COLORS = Object.freeze(['#273d5a', '#5f334b', '#51442d']);

export function createVillageNpcPopulationDefinitions(groundSampler, quality = 'high') {
	const limit = quality === 'low' ? 10 : quality === 'medium' ? 16 : 24;
	const people = [
		...ADVENTURE_CATALOG.map(quest => [quest.giver.position.x, quest.giver.position.z, true]),
		...EXTRA_PEOPLE.map(point => [point[0], point[1], false])
	].slice(0, limit);
	const parts = { bodies: [[], [], []], heads: [], legs: [], markerDots: [], markerStems: [] };
	people.forEach((person, index) => appendPerson(parts, person, index, groundSampler));
	const definitions = [
		...parts.bodies.map((boxes, index) => batch(`npc-body-${index}`, boxes, BODY_COLORS[index], TEXTURE_URLS.fabric.tanCloth, 'body')),
		batch('npc-heads', parts.heads, '#c99068', TEXTURE_URLS.fabric.parchment, 'head'),
		batch('npc-legs', parts.legs, '#24231f', TEXTURE_URLS.fabric.leather, 'legs'),
		batch('quest-marker-stems', parts.markerStems, '#ffd34f', TEXTURE_URLS.metals.gold2, 'quest-marker'),
		batch('quest-marker-dots', parts.markerDots, '#fff29c', TEXTURE_URLS.metals.gold2, 'quest-marker')
	].filter(Boolean);
	definitions.stats = {
		definitions: definitions.length,
		people: people.length,
		questGivers: people.filter(person => person[2]).length,
		realtimeAnimations: 0
	};
	return definitions;
}

function appendPerson(parts, person, index, groundSampler) {
	const [x, z, questGiver] = person;
	const y = villageGroundHeight(groundSampler, x, z);
	const scale = index % 4 === 0 ? 0.82 : 1;
	parts.bodies[index % parts.bodies.length].push(box(x, y + 1.45 * scale, z, 0.66 * scale, 1.35 * scale, 0.42 * scale));
	parts.heads.push(box(x, y + 2.35 * scale, z, 0.5 * scale, 0.5 * scale, 0.5 * scale));
	parts.legs.push(box(x - 0.17 * scale, y + 0.52 * scale, z, 0.2 * scale, 0.95 * scale, 0.22 * scale));
	parts.legs.push(box(x + 0.17 * scale, y + 0.52 * scale, z, 0.2 * scale, 0.95 * scale, 0.22 * scale));
	if (!questGiver) return;
	parts.markerStems.push(box(x, y + 3.8 * scale, z, 0.16, 0.72, 0.16));
	parts.markerDots.push(box(x, y + 3.28 * scale, z, 0.22, 0.22, 0.22));
}

function batch(id, boxes, color, textureUrl, part) {
	if (!boxes.length) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'village-npc-population',
		part,
		texturePolicy: { npcPopulation: true },
		textureUrl
	});
}

function box(x, y, z, sx, sy, sz) {
	return { position: { x, y, z }, size: { x: sx, y: sy, z: sz }, yaw: 0 };
}
