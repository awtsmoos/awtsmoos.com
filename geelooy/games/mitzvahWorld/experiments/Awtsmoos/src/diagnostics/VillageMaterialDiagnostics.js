// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMaterialDiagnostics.js
 * @description Audits live visible physical materials without counting intentional cards.
 * The Awtsmoos clothes every finite village vessel; Awtsmoos.com records hydrated stone,
 * timber, slate, and plaster while shadows, masks, labels, and procedural text remain exempt.
 */

import {
	emptyMaterialFamily,
	emptyMaterialSummary,
	materialClassification,
	materialIdentity,
	nearWhiteMaterial,
	unresolvedMaterialRecord,
	usableMaterialImage
} from './VillageMaterialDiagnosticHelpers.js';

export function inspectVillageMaterials(root) {
	const summary = emptyMaterialSummary();
	const families = {};
	const unresolved = [];
	root?.traverse?.(object => inspectObject(object, summary, families, unresolved));
	return {
		families,
		summary,
		unresolved: unresolved.slice(0, 60)
	};
}

function inspectObject(object, summary, families, unresolved) {
	if (object?.visible === false || !object?.material) return;
	const materials = Array.isArray(object.material) ? object.material : [object.material];
	for (const material of materials) {
		inspectMaterial(object, material, summary, families, unresolved);
	}
}

function inspectMaterial(object, material, summary, families, unresolved) {
	const identity = materialIdentity(object, material);
	const classification = materialClassification(identity, material);
	const mapReady = usableMaterialImage(material.mapImage);
	const mixReady = usableMaterialImage(material.mixImage);
	const url = String(material.textureUrl || '');
	const familyName = object.userData?.family || 'unclassified';
	const family = families[familyName] || emptyMaterialFamily();
	summary.materialSlots += 1;
	family.materialSlots += 1;
	if (classification.exempt) {
		summary.exemptSurfaces += 1;
		family.exemptSurfaces += 1;
	}
	if (classification.physical) {
		recordPhysical(summary, family, material, url, mapReady);
	}
	if (classification.cottage) recordCottage(summary, family, mapReady);
	if (mapReady) summary.readyMaps += 1;
	if (mixReady) summary.readyMixMaps += 1;
	if (material.mapImageFallback === true) summary.fallbackMaps += 1;
	if (classification.physical && !mapReady) {
		unresolved.push(unresolvedMaterialRecord(object, material, url, familyName));
	}
	families[familyName] = family;
}

function recordPhysical(summary, family, material, url, mapReady) {
	summary.physicalSurfaces += 1;
	family.physicalSurfaces += 1;
	if (!url || !/^https?:\/\//i.test(url)) {
		summary.missingTextureUrls += 1;
		family.missingTextureUrls += 1;
	} else if (!mapReady) {
		summary.pendingPhysicalMaps += 1;
		family.pendingPhysicalMaps += 1;
	}
	if (!mapReady && nearWhiteMaterial(material.color)) summary.whiteUntextured += 1;
}

function recordCottage(summary, family, mapReady) {
	summary.cottageSurfaces += 1;
	family.cottageSurfaces += 1;
	if (mapReady) {
		summary.cottageReady += 1;
		family.cottageReady += 1;
	} else {
		summary.cottagePending += 1;
		family.cottagePending += 1;
	}
}
