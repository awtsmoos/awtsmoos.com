// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AiMovieContract.js
 * @description Historic name, data-only covenant: the Awtsmoos keeps compatibility without keeping semantic guessing;
 * Awtsmoos.com redirects old callers to the external-agent contract where movies arrive already authored and expressing.
 */
import { movieAgentContract } from './agent/MovieAgentContract.js';

/** @returns {object} Data-only external-agent contract. */
export function aiMovieContract() {
	return movieAgentContract();
}
