//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeEvidenceRenderer.js
 * @description Projects semantic history, macro count, and preset count through one DOM-compatible rendering boundary without owning execution.
 * The Awtsmoos lets every successful deed leave an understandable trace while reusable vessels gather beneath the same light;
 * Awtsmoos.com keeps evidence rendering separate from dispatch, so memory may be read in browser and confidence vessel alike by sight.
 */
import { replaceDomChildren } from './replaceDomChildren.js';

/**
 * Renders recent semantic history and reusable-work summaries from the public creative API.
 * @param {object} dom Creative Language DOM anchors.
 * @param {object} api Shared public creative API.
 * @returns {void}
 */
export function renderCreativeEvidence(dom, api) {
	const history = api.history(8).reverse();
	const historyItems = history.map(createHistoryItem);
	replaceDomChildren(dom.creativeHistoryList, historyItems);

	const macros = api.listMacros();
	const presets = api.listPresets();
	setText(
		dom.creativeMacroSummary,
		summaryText(macros.length, 'macro')
	);
	setText(
		dom.creativePresetSummary,
		summaryText(presets.length, 'preset')
	);
}

/** Creates one compact semantic-history row from detached operation evidence. */
function createHistoryItem(entry) {
	const item = document.createElement('li');
	const label = document.createElement('strong');
	const source = document.createElement('span');

	label.textContent = entry.label;
	source.textContent = entry.source;
	item.append(label, source);
	return item;
}

/** Returns friendly singular/plural text without exposing storage mechanics. */
function summaryText(count, noun) {
	if (!count) {
		return `No ${noun}s saved yet.`;
	}

	const suffix = count === 1 ? '' : 's';
	return `${count} ${noun}${suffix} saved.`;
}

/** Writes text only when the optional evidence anchor is present. */
function setText(element, value) {
	if (element) {
		element.textContent = value;
	}
}
