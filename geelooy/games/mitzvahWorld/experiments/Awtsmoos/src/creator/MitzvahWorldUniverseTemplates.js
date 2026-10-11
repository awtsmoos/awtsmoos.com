// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldUniverseTemplates.js
 * @description Seeds starter universes into a live creator session.
 * Yaakov 2026-10-11: players start from a living template — meadow, desert,
 * alpine, night village — then make it their own. Seeding arranges the template's
 * parts in a deterministic ring around the given center, applies the template sky,
 * and returns one receipt per placed part.
 */

import { universeTemplate } from './MitzvahWorldUniverseCatalog.js';

/**
 * Seeds one universe template into a creator session.
 * @param {object} session Creator session exposing placeUniverseAt(partId, x, z) and skyDirector.
 * @param {string} templateId Universe template id.
 * @param {object} center { x, z } ring center in world units.
 * @returns {Promise<object>} Frozen { templateId, skyId, placed: [receipts] }.
 */
export async function seedUniverseTemplate(session, templateId, center = { x: 0, z: 0 }) {
	if (!session || typeof session.placeUniverseAt !== 'function') {
		throw new Error('UNIVERSE_TEMPLATE_SESSION_REQUIRED');
	}
	const template = universeTemplate(templateId);
	const placed = [];
	const parts = template.seedParts;
	const count = parts.length;
	for (let index = 0; index < count; index++) {
		const angle = (index / count) * Math.PI * 2;
		const radius = 6 + (index % 3) * 4;
		const x = (Number(center.x) || 0) + Math.cos(angle) * radius;
		const z = (Number(center.z) || 0) + Math.sin(angle) * radius;
		placed.push(await session.placeUniverseAt(parts[index], x, z));
	}
	let skyId = template.sky;
	try {
		skyId = session.applyUniverseSky ? session.applyUniverseSky(template.sky) : template.sky;
	} catch {
		skyId = template.sky;
	}
	return Object.freeze({ placed: Object.freeze(placed), skyId, templateId });
}
