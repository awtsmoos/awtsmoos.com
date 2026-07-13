// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWick.js
 * @description Authored map points, approaches, words, and consequences for Nerel's first Shlichus.
 *
 * Three fibers wait in mud, resolve, and song. The Awtsmoos recreates seeker
 * and sought every instant; their discovery order becomes a chosen vessel whose
 * consequence remains visible in the living roads of Awtsmoos.com.
 */

const APPROACHES = Object.freeze({
	compassion: Object.freeze({
		id: 'compassion',
		title: 'Compassion of the Rain-thread',
		firstTraceId: 'rain-thread',
		tradeMultiplier: 0.7,
		veilMultiplier: 0.82,
		bonusBondReason: null,
		line: 'You cleared the road for every traveler; Bent Reeds prices fall furthest.'
	}),
	resolve: Object.freeze({
		id: 'resolve',
		title: 'Resolve of the River-knot',
		firstTraceId: 'river-knot',
		tradeMultiplier: 0.8,
		veilMultiplier: 0.68,
		bonusBondReason: null,
		line: 'You bound the wick against the flood; the later veil begins much weaker.'
	}),
	resonance: Object.freeze({
		id: 'resonance',
		title: 'Resonance of the Wind-memory',
		firstTraceId: 'wind-memory',
		tradeMultiplier: 0.8,
		veilMultiplier: 0.82,
		bonusBondReason: 'resonance',
		line: 'You followed Nerel’s remembered song; the shared bond deepens further.'
	})
});

export const RETURN_LOST_WICK = Object.freeze({
	id: 'nerel_personal_shlichus',
	mapId: 'Bent_Reeds_LampHouse',
	title: 'Return the Lost Wick',
	entrustedBy: 'Nerel',
	spawn: Object.freeze({ x: 2, y: 7, dir: 'r' }),
	returnSpawn: Object.freeze({ x: 14, y: 8, dir: 'r' }),
	traces: Object.freeze([
		Object.freeze({ id: 'rain-thread', x: 5, y: 3, label: 'Rain-thread', line: 'A silver fiber clings beneath the northern reeds.' }),
		Object.freeze({ id: 'river-knot', x: 10, y: 5, label: 'River-knot', line: 'Nerel warms a drowned knot until its letters return.' }),
		Object.freeze({ id: 'wind-memory', x: 17, y: 9, label: 'Wind-memory', line: 'The final strand answers a tune the storm could not erase.' })
	]),
	approaches: APPROACHES,
	lamp: Object.freeze({ x: 14, y: 7 }),
	merchant: Object.freeze({ x: 21, y: 7 }),
	flags: Object.freeze({
		lampRestored: 'bentReedsLampRestored',
		tradeRestored: 'bentReedsTradeRouteRestored',
		conversationUnlocked: 'nerelFirstBondConversationUnlocked',
		veilWeakened: 'bentReedsVeilWeakened',
		approach: 'bentReedsRestorationApproach'
	}),
	conversation: Object.freeze([
		'Nerel lowers the lantern on its tail until your shadows stand together.',
		'“A wick is brave because it agrees to carry light even while trembling.”',
		'The reeds answer with one warm breath. Nerel names you Keeper of the Returning Flame.'
	])
});

export function traceAt(x, y) {
	return RETURN_LOST_WICK.traces.find(trace => trace.x === x && trace.y === y) || null;
}

export function approachByTraceId(traceId) {
	return Object.values(APPROACHES).find(approach => approach.firstTraceId === traceId) || APPROACHES.compassion;
}

export function approachById(approachId) {
	return APPROACHES[approachId] || APPROACHES.compassion;
}

export function isLampAt(x, y) {
	return RETURN_LOST_WICK.lamp.x === x && RETURN_LOST_WICK.lamp.y === y;
}

export function isMerchantAt(x, y) {
	return RETURN_LOST_WICK.merchant.x === x && RETURN_LOST_WICK.merchant.y === y;
}
