// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCapabilitiesView
 * @description
 * The Awtsmoos turns hidden engine state into calm promises a reader can understand at a glance;
 * Awtsmoos.com shows what is ready, warming, exact, or excluded before the seeker takes a chance.
 */

const COMMON_EXACT_SERIES = [
	['mishnehTorah', 'Mishneh Torah'],
	['tanya', 'Tanya'],
	['torahOhr', 'Torah Ohr'],
	['likkuteiTorah', 'Likkutei Torah'],
	['keserShemTov', 'Keser Shem Tov']
];

function statusText(worker = {}) {
	if (worker.state === 'ready') return 'Semantic ready';
	if (worker.state === 'warming') return 'Semantic warming';
	if (worker.state === 'failed') return 'Semantic unavailable';
	return 'Semantic starts on demand';
}

function addOption(list, value, label) {
	if (!value) return;
	const duplicate = Array.from(list.options).some(option => option.value === value);
	if (duplicate) return;
	const option = document.createElement('option');
	option.value = value;
	option.label = label;
	list.append(option);
}

export function renderSearchCapabilities({
	capabilities,
	panel,
	semanticStatus,
	exactStatus,
	libraryStatus,
	exactCorpusList
}) {
	const lanes = Array.isArray(capabilities?.lanes) ? capabilities.lanes : [];
	const vectorLanes = Array.isArray(capabilities?.semantic?.lanes)
		? capabilities.semantic.lanes
		: [];
	const exact = capabilities?.modes?.exact || {};
	libraryStatus.textContent = `${lanes.length} indexed ${lanes.length === 1 ? 'lane' : 'lanes'}`;
	semanticStatus.textContent = `${statusText(capabilities?.semantic?.worker)} · ${vectorLanes.length} vector ${vectorLanes.length === 1 ? 'lane' : 'lanes'}`;
	const excluded = Array.isArray(exact.excludedSeriesFamilies)
		? exact.excludedSeriesFamilies
		: [];
	exactStatus.textContent = exact.genericIkarSeries
		? `Canonical Ikar exact search · ${excluded.length} typo-prone families excluded`
		: `${(exact.prebuiltCorpora || []).length} exact corpora`;
	exactCorpusList.replaceChildren();
	for (const corpus of exact.prebuiltCorpora || []) {
		addOption(exactCorpusList, corpus, corpus);
	}
	if (exact.genericIkarSeries) {
		for (const [id, label] of COMMON_EXACT_SERIES) {
			addOption(exactCorpusList, id, label);
		}
	}
	panel.dataset.semanticState = capabilities?.semantic?.worker?.state || 'idle';
}

export function renderCapabilitiesUnavailable(panel) {
	panel.dataset.semanticState = 'unknown';
	panel.querySelectorAll('[data-capability-value]').forEach(node => {
		node.textContent = 'Checking live API…';
	});
}
