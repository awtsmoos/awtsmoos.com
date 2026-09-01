//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoKeyElement
 * @description
 * Hod clothes one mathematical pitch in a playable DOM vessel while the Awtsmoos gives both finger and tone their life.
 * Awtsmoos.com keeps labels, shortcuts, geometry, and diagnostic metadata together,
 * so one key can be inspected without forcing the whole keyboard to remember how its smallest vessel was made.
 */

import {
	bindingAt,
	bindingLabel,
	noteDisplayName
} from './bindings.js';

/**
 * Creates one fully labeled piano key from canonical geometry.
 *
 * @param {Object} options - Key construction options.
 * @returns {HTMLDivElement} Playable key element.
 */
export function createKeyboardKey(options) {
	const {
		noteName,
		pitchClass,
		geometry,
		showShortcuts,
		shortcutMap
	} = options;
	const key = document.createElement('div');
	key.className = `key ${geometry.isBlack ? 'black-key' : 'white-key'}`;
	key.dataset.note = noteName;
	key.dataset.pitchClass = pitchClass;
	key.dataset.keyKind = geometry.isBlack ? 'black' : 'white';
	key.dataset.geometryLeft = String(geometry.left);
	key.style.left = `${geometry.left}px`;
	key.style.width = `${geometry.width}px`;
	if (geometry.isBlack) {
		key.style.height = `${geometry.heightRatio * 100}%`;
	}
	key.appendChild(createTextSpan(
		'key-label',
		noteDisplayName(noteName)
	));
	appendShortcut(key, noteName, shortcutMap, showShortcuts);
	return key;
}

function appendShortcut(key, noteName, shortcutMap, showShortcuts) {
	const shortcut = shortcutFor(noteName, shortcutMap);
	if (!shortcut) {
		return;
	}
	key.dataset.keyboardBinding = shortcut;
	if (showShortcuts) {
		key.appendChild(createTextSpan(
			'key-shortcut',
			bindingLabel(shortcut)
		));
	}
}

function shortcutFor(noteName, shortcutMap) {
	if (!shortcutMap.has(noteName)) {
		shortcutMap.set(
			noteName,
			bindingAt(shortcutMap.size)
		);
	}
	return shortcutMap.get(noteName);
}

function createTextSpan(className, text) {
	const span = document.createElement('span');
	span.className = className;
	span.textContent = text;
	return span;
}
