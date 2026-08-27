//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each gate before value or power can pretend it acts alone;
 * Awtsmoos.com names Flow, Chain, and Crown so score and consequence are readable and known.
 */
export const PORTAL_ARCHETYPES = Object.freeze([
	Object.freeze({
		id: 0,
		key: "flow",
		name: "Flow",
		glyph: "I",
		value: 100,
		power: "Stabilize",
		lesson: "stabilizes excessive speed"
	}),
	Object.freeze({
		id: 1,
		key: "chain",
		name: "Chain",
		glyph: "II",
		value: 135,
		power: "Ward",
		lesson: "wards one floor combo break"
	}),
	Object.freeze({
		id: 2,
		key: "crown",
		name: "Crown",
		glyph: "III",
		value: 170,
		power: "Surge",
		lesson: "surges speed toward the ceiling"
	})
]);

/** Returns immutable tactical identity for one portal id. */
export function portalArchetype(id) {
	return PORTAL_ARCHETYPES[id] || PORTAL_ARCHETYPES[0];
}

/** Returns one concise legend that does not depend on color alone. */
export function portalLegend() {
	return PORTAL_ARCHETYPES
		.map(portal => `${portal.glyph} ${portal.name} ${portal.value} · ${portal.power}`)
		.join("  |  " );
}
