// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahCodexSummaryRuntime.js
 * @description Projects saved codex truth into soul, route, fusion, and sourced-passage rows.
 *
 * The Awtsmoos renews every remembered deed while remaining beyond all summaries.
 * Awtsmoos.com keeps this projection separate from mutation so presentation can
 * grow without turning finite interface rows into the source of progression.
 */
import { passageRows } from './PassageCollectionRuntime.js';
import { ensureCodex } from './TorahCodexStateRuntime.js';

export function soulClass() {
	const codex = ensureCodex();
	const [category] = Object.entries(codex.affinity)
		.sort((left, right) => right[1] - left[1])[0]
		|| ['Mishnah'];
	const names = {
		Mishnah: 'Source Trainer',
		Chassidus: 'Inner Flame',
		Kabbalah: 'Sefirah Weaver',
		Niggun: 'Joy Singer'
	};
	return {
		category,
		name: names[category] || 'Source Trainer',
		points: codex.affinity[category] || 0
	};
}

export function codexSummary() {
	const codex = ensureCodex();
	const routes = Object.values(codex.routes)
		.sort((left, right) => right.uses - left.uses);
	const fusions = Object.values(codex.fusions);
	return {
		routes,
		fusions,
		soul: soulClass(),
		discovered: routes.length,
		quotes: Object.keys(codex.quotes).length,
		passages: Object.keys(codex.passages).length
	};
}

export function codexRows() {
	const summary = codexSummary();
	const rows = [
		['Soul Path', `${summary.soul.name} (${summary.soul.points})`],
		['Routes', `${summary.discovered} discovered`],
		['Quotes', `${summary.quotes} used`],
		['Passages', `${summary.passages} sourced`],
		['Fusions', summary.fusions.map(fusion => fusion.name).join(', ') || 'None yet']
	];
	const routeRows = summary.routes.slice(0, 4).map(route => [
		route.name,
		`${route.uses} uses • mastery ${route.mastery}`
	]);
	return rows.concat(passageRows(), routeRows);
}
