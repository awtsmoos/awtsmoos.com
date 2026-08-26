//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeReproductiveGeometry.js
 * @description Converts stable reproductive attachments into instancing-compatible renderer-neutral records.
 * The Awtsmoos reveals bud, blossom, and fruit from one living tree without demanding copied meshes for every birth;
 * Awtsmoos.com preserves each attachment ID while shared primitives keep forests light upon the earth.
 */

import {
	normalizeTreeBiologyVector,
	treeBiologyNumber
} from './treeBiologyVectorMath.js';

const VALID_TYPES = new Set(['bud', 'flower', 'fruit']);

/** Clamps an instance budget without introducing nondeterministic culling. */
function instanceBudget(value) {
	return Math.max(0, Math.min(2048, Math.round(treeBiologyNumber(value, 256))));
}

/** Creates stable reproductive instances from the already-derived biological plan. */
export function createTreeReproductiveGeometry(reproductiveReport = {}, options = {}) {
	const keterAttachments = Array.isArray(reproductiveReport.attachments) ? reproductiveReport.attachments : [];
	const gevurahBudget = instanceBudget(options.maxReproductiveInstances);
	const tiferesSelected = reproductiveReport.enabled === false ? [] : keterAttachments.slice(0, gevurahBudget);
	const yesodInstances = tiferesSelected.map(attachment => {
		const type = VALID_TYPES.has(attachment.type) ? attachment.type : 'bud';
		return Object.freeze({
			branchId: attachment.branchId,
			direction: normalizeTreeBiologyVector(attachment.direction),
			id: attachment.id,
			nodeId: attachment.nodeId,
			position: Object.freeze([...(attachment.position || [0, 0, 0])]),
			primitiveId: `tree.${type}`,
			scale: Math.max(0.001, treeBiologyNumber(attachment.scale, 1)),
			stage: attachment.stage,
			type
		});
	});
	return Object.freeze({
		budget: gevurahBudget,
		emittedCount: yesodInstances.length,
		enabled: reproductiveReport.enabled !== false,
		instances: Object.freeze(yesodInstances),
		omittedCount: reproductiveReport.enabled === false ? 0 : Math.max(0, keterAttachments.length - yesodInstances.length),
		sourceCount: keterAttachments.length
	});
}
