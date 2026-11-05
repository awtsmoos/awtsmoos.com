//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowTreeRecordFactory.js
 * @description Builds one deterministic live tree record and installs its reusable frame-decision vessel.
 * The Awtsmoos gives each rooted form a name while error vessels guard the same;
 * Awtsmoos.com lets ecology remain clear in every branch that enters the game.
 */

import { createMinimalMeadowTree } from './MinimalMeadowTreeFactory.js';
import { createMinimalMeadowTreeUpdateReceipt } from './MinimalMeadowTreeUpdatePolicy.js';

/**
 * @description Creates one tree while preserving deterministic ecology metadata and non-fatal error capture.
 * @param {object} placement Deterministic placement recipe.
 * @param {object} materials Shared tree material bundle.
 * @param {Array<object>} errors Mutable construction error ledger owned by the tree system.
 * @returns {object|null} Created tree, or null when construction fails safely.
 */
export function createMinimalMeadowTreeRecord(placement, materials, errors) {
	try {
		const tree = createMinimalMeadowTree(placement, materials);
		tree.userData.AwtsmoosTree.updateDecision = createMinimalMeadowTreeUpdateReceipt();
		tree.userData.AwtsmoosTreeEcology = Object.freeze({
			ecologyZone: placement.ecologyZone,
			preset: placement.preset,
			role: placement.role
		});
		return tree;
	} catch (error) {
		errors.push({
			id: placement.id,
			message: error.message
		});
		return null;
	}
}
