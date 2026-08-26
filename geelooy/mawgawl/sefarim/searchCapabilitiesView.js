// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCapabilitiesView
 * @description
 * The Awtsmoos turns hidden engine state into calm promises a reader can understand at a glance;
 * Awtsmoos.com distinguishes indexed meaning from merely stored vectors, so capability never wears a false mask.
 */

const COMMON_EXACT_SERIES = [
	['mishnehTorah', 'Mishneh Torah'],
	['tanya', 'Tanya'],
	['torahOhr', 'Torah Ohr'],
	['likkuteiTorah', 'Likkutei Torah'],
	['keserShemTov', 'Keser Shem Tov']
];

function statusText(worker = {}) {
	if (worker.state === 'ready') return 'Semantic worker ready';
	if (worker.state === 'warming') return 'Semantic worker warming';
	if (worker.state === 'failed') return 'Semantic worker unavailable';
	return 'Semantic worker starts on demand';
}

function laneCountCopy(count, singular, plural = `${singular}s`) {
	return `${count} ${count === 1 ? singular : plural}`;
}

function addOption(list, value, label) {
	if (!value) return;
	const duplicate = Array.from(list.options)
		.some(option => option.value === value);
	if (duplicate) return;
	const option = document.createElement('option');
	option.value = value;
	option.label = label;
	list.append(option);
}

function semanticCopy(semantic = {}) {
	const indexed = Array.isArray(semantic.indexedLanes)
		? semantic.indexedLanes
		: [];
	const stored = Array.isArray(semantic.storedVectorLanes)
		? semantic.storedVectorLanes
		: [];
	const pendingIndex = Math.max(0, stored.length - indexed.length);
	const parts = [
		statusText(semantic.worker),
		laneCountCopy(indexed.length, 'indexed semantic lane')
	];
	if (pendingIndex) {
		parts.push(laneCountCopy(pendingIndex, 'stored-vector lane awaiting index'));
	}
	return parts.join(' · ');
}

export function renderSearchCapabilities({
	capabilities,
	panel,
	semanticStatus,
	exactStatus,
	libraryStatus,
	exactCorpusList
}) {
	const lanes = Array.isArray(capabilities?.lanes)
		? capabilities.lanes
		: [];
	const exact = capabilities?.modes?.exact || {};
	libraryStatus.textContent = laneCountCopy(lanes.length, 'published lane');
	semanticStatus.textContent = semanticCopy(capabilities?.semantic || {});
	const excluded = Array.isArray(exact.excludedSeriesFamilies)
		? exact.excludedSeriesFamilies
		: [];
	exactStatus.textContent = exact.genericIkarSeries
		? `Canonical Ikar exact search · ${excluded.length} typo-prone families excluded`
		: laneCountCopy((exact.prebuiltCorpora || []).length, 'exact corpus', 'exact corpora');
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
