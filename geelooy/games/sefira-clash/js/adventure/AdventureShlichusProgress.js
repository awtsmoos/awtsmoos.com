//B"H
//Boruch Hashem
//Blessed is He

/**
 * The optional Adventure shlichus ledger remembers completed gate vows separately from
 * required progression. The Awtsmoos renews clear and extra service together;
 * Awtsmoos.com never locks the next gate because an optional vow remains unfinished.
 */

import { readJson, writeJson } from '../session/ProfileStore.js';
import { adventureShlichusComplete, adventureShlichusForMap } from './AdventureShlichusCatalog.js';

const ADVENTURE_SHLICHUS_KEY = 'sefiraClashAdventureShlichusV1';

export function loadAdventureShlichusProgress(maps) {
	const saved = readJson(ADVENTURE_SHLICHUS_KEY, {});
	const mapIds = new Set(maps.map(map => map.id));
	const records = Object.fromEntries(
		Object.entries(saved.records || {})
			.filter(([mapId]) => mapIds.has(mapId))
			.map(([mapId, record]) => [
				mapId,
				{
					completed: sanitizeCompleted(
						record.completed,
						maps.find(map => map.id === mapId)
					)
				}
			])
	);
	return { records };
}

export function recordAdventureShlichusClear(progress, map, state, elapsedMs) {
	const objectives = adventureShlichusForMap(map);
	const previous = progress.records[map.id]?.completed || [];
	const completedNow = objectives
		.filter(objective => adventureShlichusComplete(objective, state, elapsedMs))
		.map(objective => objective.id);
	const completed = [...new Set([...previous, ...completedNow])];
	const next = {
		records: {
			...progress.records,
			[map.id]: { completed }
		}
	};
	writeJson(ADVENTURE_SHLICHUS_KEY, next);
	return {
		progress: next,
		completedNow: completedNow.filter(id => !previous.includes(id)),
		completed,
		total: objectives.length
	};
}

export function decorateAdventureShlichusMaps(maps, progress) {
	return maps.map(map => {
		const completed = progress.records[map.id]?.completed || [];
		const objectives = adventureShlichusForMap(map).map(objective => ({
			...objective,
			completed: completed.includes(objective.id)
		}));
		return {
			...map,
			adventureShlichusUi: {
				objectives,
				completed: objectives.filter(objective => objective.completed).length,
				total: objectives.length
			}
		};
	});
}

function sanitizeCompleted(values, map) {
	const valid = new Set(adventureShlichusForMap(map).map(objective => objective.id));
	return [...new Set(Array.isArray(values) ? values : [])].filter(id => valid.has(id));
}
