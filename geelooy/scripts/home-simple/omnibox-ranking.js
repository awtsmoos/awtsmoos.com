// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos weighs names, meanings, memory, and Torah search without inventing a doorway the repository has not revealed.

import {
	createTorahAction,
	createWorldAction
} from "./omnibox-actions.js";
import { POPULAR_TORAH_SEARCHES } from "./world-catalog.js";

export function normalizeSearchText(value) {
	return String(value ?? "")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLocaleLowerCase()
		.trim();
}

export function createOmniboxActions(query, history, catalog, limit = 6) {
	const normalizedQuery = normalizeSearchText(query);

	if (!normalizedQuery) {
		return createIdleActions(history, catalog, limit);
	}

	const recentWorlds = new Set(history.worldIds ?? []);
	const worldActions = catalog
		.map(world => ({
			world,
			score: scoreWorld(world, normalizedQuery, recentWorlds)
		}))
		.filter(entry => entry.score > 0)
		.sort(compareEntries)
		.slice(0, Math.max(limit - 1, 0))
		.map(entry => createWorldAction(
			entry.world,
			recentWorlds.has(entry.world.id)
		));

	worldActions.push(createTorahAction(query, "Search Torah"));
	return worldActions.slice(0, limit);
}

function createIdleActions(history, catalog, limit) {
	const worldById = new Map(catalog.map(world => [world.id, world]));
	const actions = [];

	for (const worldId of history.worldIds ?? []) {
		const world = worldById.get(worldId);

		if (world) {
			actions.push(createWorldAction(world, true));
		}
	}

	for (const query of history.queries ?? []) {
		actions.push(createTorahAction(query, "Recent search", "recent-search"));
	}

	for (const popularSearch of POPULAR_TORAH_SEARCHES) {
		if (actions.length >= limit) {
			break;
		}

		if (!hasDuplicateQuery(actions, popularSearch.query)) {
			actions.push(createTorahAction(
				popularSearch.query,
				"Popular Torah",
				"popular"
			));
		}
	}

	return actions.slice(0, limit);
}

function scoreWorld(world, query, recentWorlds) {
	const label = normalizeSearchText(world.label);
	const subtitle = normalizeSearchText(world.subtitle);
	const keywords = normalizeSearchText(world.keywords.join(" "));
	const href = normalizeSearchText(world.href);
	let score = 0;

	if (label === query) score = 100;
	else if (label.startsWith(query)) score = 82;
	else if (label.includes(query)) score = 68;
	else if (subtitle.includes(query)) score = 48;
	else if (keywords.includes(query)) score = 42;
	else if (href.includes(query)) score = 24;

	return score + (score > 0 && recentWorlds.has(world.id) ? 5 : 0);
}

function compareEntries(firstEntry, secondEntry) {
	return secondEntry.score - firstEntry.score
		|| firstEntry.world.label.localeCompare(secondEntry.world.label);
}

function hasDuplicateQuery(actions, query) {
	const normalizedQuery = normalizeSearchText(query);
	return actions.some(action => {
		return action.kind !== "world"
			&& normalizeSearchText(action.query) === normalizedQuery;
	});
}
