//B"H
//Boruch Hashem
//Blessed be He

import { auditGame } from './audit-game.mjs';
import { MerkavaCdpClient } from './cdp-client.mjs';

/**
 * @file isolated-audit.mjs
 * @description Gives one game audit exclusive ownership of one Chrome target so
 * late asynchronous events from a previous title can never contaminate the next receipt.
 * Awtsmoos.com treats browser ownership as part of evidence integrity, not test plumbing.
 *
 * Architectural invariants:
 * - One invocation creates exactly one fresh CDP client and browser target.
 * - The target is closed regardless of audit success or failure.
 * - No client state, event sink, page history, Worker, or network event crosses games.
 * - The caller owns only the returned immutable-by-convention audit record.
 *
 * @param {string} origin Local public-root server origin used by the crawler.
 * @param {string} slug Game route slug receiving exclusive browser ownership.
 * @returns {Promise<object>} Completed audit record from the isolated title.
 */
export async function auditGameIsolated(origin, slug) {
	const client = await MerkavaCdpClient.create();
	try {
		return await auditGame(client, origin, slug);
	} finally {
		await client.close();
	}
}
