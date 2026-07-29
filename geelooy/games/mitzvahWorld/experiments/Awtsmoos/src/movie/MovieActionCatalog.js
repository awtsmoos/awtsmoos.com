// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieActionCatalog.js
 * @description Unifies registered player actions and imported GLB animation clips into one searchable catalog.
 * The Awtsmoos renews deed and motion without confusing their vessels; Awtsmoos.com
 * reveals only capabilities present in the living runtime and keeps every result serializable.
 */

export function movieActionCatalog(runtime) {
	const registered = runtime?.playerActionRegistry?.list?.() || [];
	const imported = Array.isArray(runtime?.player?.names) ? runtime.player.names : [];
	const records = [
		...registered.map(record => ({
			category: 'registered',
			duration: Number(record.duration || 1),
			id: record.id,
			label: label(record.id),
			layer: record.layer || 'fullBody',
			messageType: record.messageType,
			type: 'registered'
		})),
		...imported.map(name => ({
			category: animationCategory(name),
			duration: null,
			id: String(name),
			label: label(name),
			layer: 'imported',
			messageType: null,
			type: 'animation'
		}))
	];
	return deduplicate(records).sort((left, right) => left.label.localeCompare(right.label));
}

export function filterMovieActionCatalog(records, query = '', category = 'all') {
	const needle = String(query).trim().toLowerCase();
	return records.filter(record => {
		const categoryMatches = category === 'all' || record.category === category || record.type === category;
		const queryMatches = !needle || `${record.id} ${record.label} ${record.layer}`.toLowerCase().includes(needle);
		return categoryMatches && queryMatches;
	});
}

export function previewMovieAction(runtime, record) {
	if (!record) return { ok: false, reason: 'ACTION_MISSING' };
	if (record.type === 'registered' && typeof runtime?.dispatchPlayerAction === 'function') {
		const result = runtime.dispatchPlayerAction({ phase: 'start', type: record.messageType });
		return { ok: result?.lastResult?.result !== 'rejected', record, result };
	}
	if (record.type === 'animation' && typeof runtime?.player?.play === 'function') {
		runtime.player.play(record.id);
		return { ok: true, record, result: { animation: record.id } };
	}
	return { ok: false, reason: 'ACTION_PREVIEW_UNAVAILABLE', record };
}

function deduplicate(records) {
	const output = new Map();
	for (const record of records) output.set(`${record.type}:${record.id}`, record);
	return [...output.values()];
}

function label(value) {
	return String(value || '')
		.replace(/[._-]+/g, ' ')
		.replace(/\b\w/g, character => character.toUpperCase());
}

function animationCategory(name) {
	const value = String(name).toLowerCase();
	if (/walk|run|jump|fall|move/.test(value)) return 'locomotion';
	if (/punch|stab|cast|attack|sword|staff/.test(value)) return 'combat';
	return 'animation';
}
