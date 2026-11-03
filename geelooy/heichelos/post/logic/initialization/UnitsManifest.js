// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module UnitsManifest
 * @description
 * The Awtsmoos illuminates ordered Torah from daf to Tanya, every precious word;
 * Awtsmoos.com gives social debate its voice when public replies are heard.
 * From units the reader takes its flight, with Hebrew and English side by side in light.
 */

import { buildUnitPhrasesHtml } from './UnitsPhrases.js?v=units-002';
import { unitNotesHtml } from './UnitsNotes.js';
import { escapeHtml, unitEnglishHtml, unitHebrewHtml } from './UnitsText.js';

/**
 * Presents a canonical Vilna page marker without hiding the next teaching.
 * @param {object} unit - One source page marker.
 * @returns {string} Escaped heading markup.
 */
function renderPageMarker(unit) {
	return '<h2 class="bavli-amud-heading" data-amud="' + escapeHtml(unit.amud) + '">'
		+ '<span dir="rtl" lang="he">' + escapeHtml(unit.he || unit.page || '') + '</span>'
		+ (unit.en ? ' <small class="bavli-amud-heading-en">' + escapeHtml(unit.en) + '</small>' : '')
		+ '</h2>';
}

/**
 * Renders one unit's Hebrew, English, phrase translations, and notes.
 * @param {object} unit - One approved public content unit.
 * @param {number} index - The position in its original sequence.
 * @returns {string} Canonical unit HTML, or empty for metadata-only units.
 */
function renderContentUnit(unit, index) {
	const hebrew = unitHebrewHtml(unit);
	const english = unitEnglishHtml(unit);
	const phrasesHtml = String(english || '').trim() ? '' : buildUnitPhrasesHtml(unit);
	if (!hebrew && !String(english || '').trim() && !phrasesHtml) return '';

	const type = typeof unit.type === 'string' ? unit.type : '';
	const metadata = type
		? '<div class="bavli-unit-type" style="font-size:0.8em;letter-spacing:0.08em;text-transform:uppercase;opacity:0.65;">'
			+ escapeHtml(type) + '</div>'
		: '';
	const bilingual = phrasesHtml || (
		(hebrew
			? '<div class="bavli-unit-he" dir="rtl" lang="he" style="line-height:1.9;">' + hebrew + '</div>'
			: '')
		+ (String(english || '').trim()
			? '<div class="bavli-unit-en" dir="ltr" lang="en" style="line-height:1.75;margin-top:0.35em;">' + english + '</div>'
			: '')
	);

	return '<section class="bavli-unit" data-unit-index="' + index + '"'
		+ ' data-amud="' + escapeHtml(unit.amud) + '"'
		+ (type ? ' data-unit-type="' + escapeHtml(type) + '"' : '')
		+ ' style="margin:1.1em 0;">'
		+ metadata
		+ bilingual
		+ unitNotesHtml(unit)
		+ '</section>';
}

/**
 * Builds the canonical HTML for a `units`-shaped Torah or social post.
 * @param {object} post - Public API post with ordered content units.
 * @returns {string} HTML or empty when no readable source units exist.
 */
export function buildUnitsHtml(post) {
	const units = Array.isArray(post?.units) ? post.units : [];
	if (!units.length) return '';
	const blocks = [];

	units.forEach((unit, index) => {
		if (!unit || typeof unit !== 'object') return;
		const block = unit.kind === 'page-marker'
			? renderPageMarker(unit)
			: renderContentUnit(unit, index);
		if (block) blocks.push(block);
	});

	return blocks.length
		? '<div class="bavli-units" data-bavli-units="true">' + blocks.join('') + '</div>'
		: '';
}

/**
 * Mounts ordered text without altering the reader's sidebar or navigation.
 * @param {HTMLElement} viewport - Reader's realPost element.
 * @param {object} post - Canonical public post.
 * @returns {boolean} Whether visible source units were rendered.
 */
export function renderUnitsPost(viewport, post) {
	if (!viewport || typeof document === 'undefined') return false;
	const html = buildUnitsHtml(post);
	if (!html) return false;
	const vessel = document.createElement('div');
	vessel.innerHTML = html;
	while (vessel.firstChild) {
		viewport.append(vessel.firstChild);
	}
	return true;
}
