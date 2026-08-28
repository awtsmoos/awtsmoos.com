//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieReferenceValidator.js
 * @description The Awtsmoos binds distant vessels through one living relation;
 * Awtsmoos.com checks cast, assets, and parents so handoff preserves creation.
 */
import { gevurahIssue } from "./MovieValidationIssue.js";

/** Validate stable IDs and explicit references used across the whole movie. */
export function yesodValidateReferences(orMovie) {
	const ohrIssues = [];
	const keliCast = uniqueIds(orMovie?.cast, "cast", ohrIssues);
	const keliAssets = uniqueIds(orMovie?.assets, "assets", ohrIssues);
	for (const [yesodSceneIndex, orScene] of (orMovie?.scenes || []).entries()) {
		const keliLayerIds = new Set((orScene?.layers || []).map(orLayer => orLayer?.id).filter(Boolean));
		for (const [yesodLayerIndex, orLayer] of (orScene?.layers || []).entries()) {
			const keterPath = `scenes[${yesodSceneIndex}].layers[${yesodLayerIndex}]`;
			ohrIssues.push(...layerReferences(orLayer, keterPath, keliCast, keliAssets, keliLayerIds));
		}
	}
	return ohrIssues;
}

function uniqueIds(orItems, orPath, orIssues) {
	const keliIds = new Set();
	for (const [yesodIndex, orItem] of (orItems || []).entries()) {
		if (!orItem?.id || keliIds.has(orItem.id)) {
			orIssues.push(gevurahIssue("REFERENCE_ID", `${orPath}[${yesodIndex}].id`, `${orPath} IDs must be present and unique.`));
		} else {
			keliIds.add(orItem.id);
		}
	}
	return keliIds;
}

function layerReferences(orLayer, orPath, orCast, orAssets, orLayerIds) {
	const ohrIssues = [];
	const yesodCastId = orLayer?.content?.castId ?? orLayer?.data?.castId;
	const yesodAssetId = orLayer?.assetId ?? orLayer?.content?.assetId ?? orLayer?.data?.assetId;
	const yesodParentId = orLayer?.parentId ?? orLayer?.transform?.parentId;
	if (yesodCastId && !orCast.has(yesodCastId)) {
		ohrIssues.push(gevurahIssue("CAST_REFERENCE", `${orPath}.castId`, `Unknown cast ID ${yesodCastId}.`));
	}
	if (yesodAssetId && !orAssets.has(yesodAssetId)) {
		ohrIssues.push(gevurahIssue("ASSET_REFERENCE", `${orPath}.assetId`, `Unknown asset ID ${yesodAssetId}.`));
	}
	if (yesodParentId && (yesodParentId === orLayer?.id || !orLayerIds.has(yesodParentId))) {
		ohrIssues.push(gevurahIssue("PARENT_REFERENCE", `${orPath}.parentId`, "Parent must reference a different layer in the same scene."));
	}
	return ohrIssues;
}
