//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every named moment while a human glance needs only a few clear lights;
 * Awtsmoos.com selects six daily anchors without changing the deeper eighteen zmanim rights.
 */

import { ZMAN_DEFINITIONS } from "../config/zmanim.js";

export const KEY_ZMAN_IDS = Object.freeze([
	"alos",
	"sunrise",
	"sofShema",
	"chatzos",
	"sunset",
	"tzeis"
]);

const DEFINITIONS_BY_ID = new Map(
	ZMAN_DEFINITIONS.map(definition => {
		return [definition.id, definition];
	})
);

/** Select the six high-signal daily anchors from a canonical calculation result. */
export function selectKeyZmanim(times) {
	const selected = [];
	for (const id of KEY_ZMAN_IDS) {
		const definition = DEFINITIONS_BY_ID.get(id);
		const time = times[id];
		selected.push({
			...definition,
			time,
			available: time instanceof Date && !Number.isNaN(time.getTime())
		});
	}
	return selected;
}
