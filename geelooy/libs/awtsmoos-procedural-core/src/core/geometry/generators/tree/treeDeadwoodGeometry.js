//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeDeadwoodGeometry.js
 * @description Places stable deadwood markers by sampling the canonical branch skeleton at biological break locations.
 * The Awtsmoos renews even weathering and fracture without severing the law from which the living branch was drawn;
 * Awtsmoos.com keeps deadwood additive, semantic, and cheap while canonical topology remains the crown.
 */

import { sampleTreeBranchAt } from './treeBranchSample.js';
import { treeBiologyNumber } from './treeBiologyVectorMath.js';

/** Returns one bounded deadwood instance budget. */
function deadwoodBudget(value) {
	return Math.max(0, Math.min(1024, Math.round(treeBiologyNumber(value, 128))));
}

/** Creates instanced deadwood geometry records from the existing deadwood plan. */
export function createTreeDeadwoodGeometry(deadwoodReport = {}, skeleton = {}, options = {}) {
	const keterFeatures = Array.isArray(deadwoodReport.features) ? deadwoodReport.features : [];
	const gevurahBudget = deadwoodBudget(options.maxDeadwoodInstances);
	const tiferesSelected = deadwoodReport.enabled === false ? [] : keterFeatures.slice(0, gevurahBudget);
	const yesodBranches = new Map((skeleton.branches || []).map(branch => [branch.id, branch]));
	const binahInstances = [];
	let unresolvedCount = 0;
	for (const feature of tiferesSelected) {
		const sample = sampleTreeBranchAt(yesodBranches.get(feature.branchId), feature.breakT);
		if (!sample) {
			unresolvedCount += 1;
			continue;
		}
		const severity = Math.max(0, Math.min(1, treeBiologyNumber(feature.severity, 0.5)));
		const radius = Math.max(0.001, treeBiologyNumber(sample.radius, 0.02));
		binahInstances.push(Object.freeze({
			branchId: feature.branchId,
			direction: sample.direction,
			id: feature.id,
			kind: feature.kind,
			position: Object.freeze([...sample.position]),
			primitiveId: 'tree.deadwood',
			scale: Object.freeze([
				radius * (1 + severity * 0.35),
				Math.max(radius * 0.12, radius * (0.45 + severity * 0.65)),
				radius * (1 + severity * 0.35)
			]),
			severity
		}));
	}
	return Object.freeze({
		budget: gevurahBudget,
		emittedCount: binahInstances.length,
		enabled: deadwoodReport.enabled !== false,
		instances: Object.freeze(binahInstances),
		omittedCount: deadwoodReport.enabled === false ? 0 : Math.max(0, keterFeatures.length - tiferesSelected.length),
		sourceCount: keterFeatures.length,
		unresolvedCount
	});
}
