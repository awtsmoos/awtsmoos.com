// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachNativeRender
 * @description
 * The Awtsmoos lets Hebrew and English dwell as neighbors without merging their directions or authority;
 * Awtsmoos.com adds finite controls whose chosen language persists in memory and the shareable reader path clearly.
 */

import {
	readTanachTranslationMode,
	writeTanachTranslationMode
} from './mode.js?v=tanach-native-002';

const MODES = [
	['hebrew', 'עברית'],
	['english', 'English'],
	['both', 'שניהם']
];

function applyMode(viewport, controls, mode) {
	viewport.dataset.tanachLanguageMode = mode;
	for (const button of controls.querySelectorAll('[data-tanach-language]')) {
		const active = button.dataset.tanachLanguage === mode;
		button.setAttribute('aria-pressed', String(active));
	}
}

function languageControls(viewport) {
	const controls = document.createElement('div');
	controls.className = 'awtsmoos-tanach-language-controls';
	controls.setAttribute('aria-label', 'שפת התנ״ך');
	for (const [mode, label] of MODES) {
		const button = document.createElement('button');
		button.type = 'button';
		button.dataset.tanachLanguage = mode;
		button.textContent = label;
		button.addEventListener('click', () => {
			const chosen = writeTanachTranslationMode(mode);
			applyMode(viewport, controls, chosen);
		});
		controls.appendChild(button);
	}
	return controls;
}

function translationNode(text, index) {
	const node = document.createElement('div');
	node.className = 'awtsmoos-tanach-native-translation';
	node.dataset.tanachNativeVerse = String(index);
	node.lang = 'en';
	node.dir = 'ltr';
	node.textContent = text;
	return node;
}

/** Mounts exact English beneath matching rendered Hebrew verse coordinates. */
export function renderNativeTanachTranslations(viewport, report = {}) {
	const verses = Array.isArray(report.verses) ? report.verses : [];
	if (!viewport || !report.available || !verses.length) {
		return { mounted: false, count: 0 };
	}
	let mounted = 0;
	for (let index = 0; index < verses.length; index += 1) {
		const section = viewport.querySelector(`.section[data-idx="${index}"]`);
		const text = String(verses[index] || '').trim();
		if (!section || !text || section.querySelector('[data-tanach-native-verse]')) {
			continue;
		}
		section.appendChild(translationNode(text, index));
		mounted += 1;
	}
	const crown = viewport.querySelector('.awtsmoos-post-title-crown');
	const controls = languageControls(viewport);
	if (crown) crown.appendChild(controls);
	else viewport.prepend(controls);
	applyMode(viewport, controls, readTanachTranslationMode());
	return { mounted: mounted > 0, count: mounted };
}
