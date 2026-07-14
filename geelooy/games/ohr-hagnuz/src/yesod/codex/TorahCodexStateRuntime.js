// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahCodexStateRuntime.js
 * @description Owns route practice, quote use, fusion discovery, and affinity mutation.
 *
 * The Awtsmoos renews each practiced deed while remaining beyond every measure.
 * Awtsmoos.com keeps mutable learning history in this focused vessel so sourced
 * passages and view projections need not become entangled with progression rules.
 */
import { State } from '../../binah/State.js';
import {
	TorahFusionRecipes,
	routeFamilyById,
	routeFamilyByTitle,
	zoneThemeForMap
} from '../../data/concepts/TorahCodexIndex.js';

function emptyCodex() {
	return {
		routes: {},
		quotes: {},
		fusions: {},
		passages: {},
		affinity: {
			Mishnah: 0,
			Chassidus: 0,
			Kabbalah: 0,
			Niggun: 0
		}
	};
}

export function ensureCodex() {
	State.TorahCodex ||= emptyCodex();
	State.TorahCodex.routes ||= {};
	State.TorahCodex.quotes ||= {};
	State.TorahCodex.fusions ||= {};
	State.TorahCodex.passages ||= {};
	State.TorahCodex.affinity ||= emptyCodex().affinity;
	return State.TorahCodex;
}

export function recordQuoteUse(move) {
	const codex = ensureCodex();
	const routeId = routeFamilyByTitle(move?.routeTitle)
		|| move?.path?.routeId
		|| 'avos';
	const quoteId = `${routeId}:${move?.chapterTitle || 'chapter'}:${move?.routeQuote || move?.name || 'quote'}`;
	const family = routeFamilyById(routeId);
	codex.routes[routeId] ||= {
		id: routeId,
		uses: 0,
		mastery: 0,
		name: family?.name || move?.routeTitle || routeId
	};
	codex.routes[routeId].uses += 1;
	codex.routes[routeId].mastery = masteryFromUses(codex.routes[routeId].uses);
	codex.quotes[quoteId] = (codex.quotes[quoteId] || 0) + 1;
	if (move?.category) {
		codex.affinity[move.category] = (codex.affinity[move.category] || 0) + 1;
	}
	return { routeId, quoteId, unlocked: unlockFusions() };
}

export function discoverZoneRoute(mapId) {
	const theme = zoneThemeForMap(mapId);
	const codex = ensureCodex();
	codex.routes[theme.route] ||= {
		id: theme.route,
		uses: 0,
		mastery: 0,
		name: routeFamilyById(theme.route)?.name || theme.route
	};
	return theme;
}

export function unlockFusions() {
	const codex = ensureCodex();
	const unlocked = [];
	for (const recipe of TorahFusionRecipes) {
		const ready = recipe.needs.every(id => (codex.routes[id]?.uses || 0) > 0);
		if (ready && !codex.fusions[recipe.id]) {
			codex.fusions[recipe.id] = {
				id: recipe.id,
				name: recipe.name,
				quote: recipe.quote,
				bonus: recipe.bonus
			};
			unlocked.push(recipe.name);
		}
	}
	return unlocked;
}

export function fusionStats() {
	return Object.values(ensureCodex().fusions).reduce((sum, fusion) => {
		for (const [key, value] of Object.entries(fusion.bonus || {})) {
			sum[key] = (sum[key] || 0) + value;
		}
		return sum;
	}, {});
}

function masteryFromUses(uses) {
	if (uses >= 12) return 3;
	if (uses >= 5) return 2;
	if (uses >= 2) return 1;
	return 0;
}
