//B"H
//Blessed is He
//Boruch Hashem

/**
 * @fileoverview Canonical renderer for units-shaped posts (Bavli daf corpus).
 *
 * The Awtsmoos speaks one Torah through many vessels. Custom Bavli posts
 * carry their teaching as ordered `units` — Vilna page markers, Mishna and
 * Gemara segments, each with Hebrew, English, notes and commentary attached.
 * The section scribe reads only `sections`, so without this vessel a daf
 * renders as an empty shell. Here every unit is manifested in order, its
 * Hebrew and English interleaved unit by unit, so the page shows the daf.
 *
 * The builder is a pure function of the post record (no DOM access) so it
 * can be unit-tested in Node; the mounter is deliberately dependency-free.
 */

import { buildUnitPhrasesHtml } from './UnitsPhrases.js?v=units-002';

/**
 * Escapes HTML special characters in plain-text values.
 * @param {unknown} value Raw value.
 * @returns {string} Escaped string.
 */
function escapeHtml(value) {
	return String(value == null ? '' : value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Removes Steinsaltz note-anchor markers (`<note data-assoc="..."/>`) from
 * rich English HTML. The notes themselves render from the notes fields.
 * @param {string} html Rich English HTML.
 * @returns {string} HTML without note markers.
 */
function stripNoteMarkers(html) {
	return String(html || '').replace(/<note\b[^>]*\/?>/gi, '');
}

/**
 * Resolves the Hebrew HTML for one content unit. `textHeb` is the rich
 * Hebrew (already marked up with <b>/<small> by the source vessel, the same
 * trust level as post.content elsewhere in this reader); `he` is the plain
 * vocalized text and is escaped.
 * @param {object} unit Content unit.
 * @returns {string} Hebrew HTML (may be empty).
 */
function unitHebrewHtml(unit) {
	if (typeof unit.textHeb === 'string' && unit.textHeb.trim()) {
		return unit.textHeb;
	}
	if (typeof unit.he === 'string' && unit.he.trim()) {
		return escapeHtml(unit.he);
	}
	return '';
}

/**
 * Builds the notes shelf HTML for one unit from its English and Hebrew
 * note lists ({titleEng/titleHeb, text}).
 * @param {object} unit Content unit.
 * @returns {string} Notes HTML (may be empty).
 */
function unitNotesHtml(unit) {
	const parts = [];
	const addNotes = (notes, dir, lang, titleKey) => {
		if (!Array.isArray(notes)) return;
		for (const note of notes) {
			if (!note || typeof note !== 'object') continue;
			const title = note[titleKey] || note.titleEng || note.titleHeb || '';
			const text = typeof note.text === 'string' ? note.text : '';
			if (!title && !text) continue;
			parts.push(
				'<div class="bavli-unit-note" dir="' + dir + '" lang="' + lang + '">'
				+ (title ? '<span class="bavli-unit-note-title">' + escapeHtml(title) + '</span> ' : '')
				+ text
				+ '</div>'
			);
		}
	};
	addNotes(unit.notesEng, 'ltr', 'en', 'titleEng');
	addNotes(unit.notesHeb, 'rtl', 'he', 'titleHeb');
	if (!parts.length) return '';
	return '<aside class="bavli-unit-notes">' + parts.join('') + '</aside>';
}

/**
 * Builds the canonical HTML for a units-shaped post. Pure function.
 * @param {object} post Post record with a `units` array.
 * @returns {string} HTML string (empty when the post carries no units).
 */
export function buildUnitsHtml(post) {
	const units = Array.isArray(post?.units) ? post.units : [];
	if (!units.length) return '';
	const blocks = [];
	units.forEach((unit, index) => {
		if (!unit || typeof unit !== 'object') return;
		if (unit.kind === 'page-marker') {
			blocks.push(
				'<h2 class="bavli-amud-heading" data-amud="' + escapeHtml(unit.amud) + '">'
				+ '<span dir="rtl" lang="he">' + escapeHtml(unit.he || unit.page || '') + '</span>'
				+ (unit.en ? ' <small class="bavli-amud-heading-en">' + escapeHtml(unit.en) + '</small>' : '')
				+ '</h2>'
			);
			return;
		}
		const hebrew = unitHebrewHtml(unit);
		const english = stripNoteMarkers(unit.en);
		// B"H — phrases-shaped units (Toras Chaim) carry their English in
		// phrases[] rather than a unit-level en; when present, the phrases
		// ARE the unit's bilingual text and render interleaved instead of
		// the Hebrew-only block.
		const phrasesHtml = String(english || '').trim()
			? ''
			: buildUnitPhrasesHtml(unit);
		if (!hebrew && !String(english || '').trim() && !phrasesHtml) return;
		const type = typeof unit.type === 'string' ? unit.type : '';
		blocks.push(
			'<section class="bavli-unit" data-unit-index="' + index + '"'
			+ ' data-amud="' + escapeHtml(unit.amud) + '"'
			+ (type ? ' data-unit-type="' + escapeHtml(type) + '"' : '')
			+ ' style="margin:1.1em 0;">'
			+ (type ? '<div class="bavli-unit-type" style="font-size:0.8em;letter-spacing:0.08em;text-transform:uppercase;opacity:0.65;">' + escapeHtml(type) + '</div>' : '')
			+ (phrasesHtml
				? phrasesHtml
				: (hebrew ? '<div class="bavli-unit-he" dir="rtl" lang="he" style="line-height:1.9;">' + hebrew + '</div>' : '')
					+ (String(english || '').trim() ? '<div class="bavli-unit-en" dir="ltr" lang="en" style="line-height:1.75;margin-top:0.35em;">' + english + '</div>' : ''))
			+ unitNotesHtml(unit)
			+ '</section>'
		);
	});
	if (!blocks.length) return '';
	return '<div class="bavli-units" data-bavli-units="true">' + blocks.join('') + '</div>';
}

/**
 * Mounts a units-shaped post into the reader viewport.
 * @param {HTMLElement} viewport Reader viewport (#realPost).
 * @param {object} post Post record with a `units` array.
 * @returns {boolean} True when units were manifested.
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
