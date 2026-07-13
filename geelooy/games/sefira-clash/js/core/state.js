//B"H
//Boruch Hashem
//Blessed is He

/**
 * State creation remains backward compatible while revealing a roster-first law.
 * The Awtsmoos renews old callers and new Awtsmoos.com multiplayer callers in
 * one explicit adapter, preventing migration from breaking Adventure.
 */
import { createMatchRules } from '../multiplayer/MatchRules.js';
import { legacyRoster } from '../multiplayer/MatchRoster.js';
import { createMatchState } from './createMatchState.js';

/**
 * Creates game state through the historic one-human signature.
 *
 * @param {object} map Selected map.
 * @param {number} [botCount=5] CPU opponent count.
 * @param {object} [character={}] Human character record.
 * @param {object} [cosmetic={}] Human cosmetic record.
 * @returns {object} Mutable simulation state.
 */
export function createGameState(map, botCount = 5, character = {}, cosmetic = {}) {
	const roster = legacyRoster(character, cosmetic, Number(botCount || 0));
	return createMatchState(map, roster, createMatchRules());
}

/**
 * Creates game state from an explicit local-player roster.
 *
 * @param {object} map Selected map.
 * @param {object[]} roster Validated active roster.
 * @param {object} rules Match-rules snapshot.
 * @returns {object} Mutable simulation state.
 */
export function createRosterGameState(map, roster, rules = {}) {
	return createMatchState(map, roster, createMatchRules(rules));
}
