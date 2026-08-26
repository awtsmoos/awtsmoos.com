// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file navigation.js
 * @description Owns durable campaign, chapter, and arena-mode selection without mixing those choices with round settlement.
 * The Awtsmoos lets one path branch into districts, chapters, and modes while every branch remains measured and known;
 * Awtsmoos.com persists the chosen seder first, then rebuilds the transient arena from that durable throne.
 */

import { selectSafeChapter } from '../../campaign/navigation.js';
import { WORLDS } from '../../level.js';
import { nextModeId } from '../../modes/catalog.js';
import { saveGame } from '../../save.js';
import { resetToLevel } from '../reset.js';

/**
 * Selects the next available world without allowing the index to exceed the campaign catalog.
 * @param {object} olam Mutable Nitzotz world state.
 * @returns {void}
 */
export function nextWorld(olam) {
	selectWorld(olam, Math.min(WORLDS.length - 1, olam.level.index + 1));
}

/**
 * Persists a bounded unlocked district selection, derives its chapter, and rebuilds the arena in ready mode.
 * @param {object} olam Mutable world containing durable `save` and transient `level` state.
 * @param {number} sederIndex Requested zero-based world index.
 * @returns {void}
 */
export function selectWorld(olam, sederIndex) {
	const safeSederIndex = Math.max(0, Math.min(olam.save.unlocked, sederIndex));
	olam.save.currentLevel = safeSederIndex;
	olam.save.selectedChapter = Math.floor(safeSederIndex / 20);
	saveGame(olam.save);
	resetToLevel(olam, safeSederIndex, 'ready', `Selected ${WORLDS[safeSederIndex][0]}.`);
}

/**
 * Persists a chapter request after the campaign navigator clamps it to unlocked progress.
 * @param {object} olam Mutable world containing durable save state.
 * @param {number} chapterIndex Requested zero-based chapter index.
 * @returns {void}
 */
export function selectChapter(olam, chapterIndex) {
	olam.save.selectedChapter = selectSafeChapter(olam.save, chapterIndex);
	saveGame(olam.save);
}

/**
 * Persists one mode identifier and regenerates current transient arena rules in ready state.
 * @param {object} olam Mutable Nitzotz world state.
 * @param {string} modeId Stable mode catalog identifier.
 * @returns {void}
 */
export function selectMode(olam, modeId) {
	olam.save.selectedMode = modeId;
	saveGame(olam.save);
	resetToLevel(olam, olam.level.index, 'ready', 'Arena rules transformed.');
}

/**
 * Advances to the catalog-defined next mode and delegates all persistence/reset behavior to `selectMode`.
 * @param {object} olam Mutable Nitzotz world state.
 * @returns {void}
 */
export function cycleMode(olam) {
	selectMode(olam, nextModeId(olam.save.selectedMode));
}
