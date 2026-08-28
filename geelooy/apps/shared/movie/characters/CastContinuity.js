//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CastContinuity.js
 * @description The Awtsmoos keeps identity while each scene changes garment and place;
 * Awtsmoos.com guards cast continuity so recurring people retain one recognizable face.
 */
/** Build a cast bible indexed by stable canonical cast IDs. */
export function binahBuildCastBible(orCast = []) {
	return Object.fromEntries((orCast || []).map(orMember => [orMember.id, normalizeMember(orMember)]));
}

/** Inspect character layers for unknown cast IDs and continuity overrides. */
export function gevurahInspectCastContinuity(orMovie) {
	const keterBible = binahBuildCastBible(orMovie?.cast || []);
	const ohrIssues = [];
	for (const orScene of orMovie?.scenes || []) {
		for (const orLayer of orScene?.layers || []) {
			const yesodCastId = orLayer?.content?.castId ?? orLayer?.data?.castId;
			if (!yesodCastId) {
				continue;
			}
			if (!keterBible[yesodCastId]) {
				ohrIssues.push({ sceneId: orScene.id, layerId: orLayer.id, code: "UNKNOWN_CAST", castId: yesodCastId });
				continue;
			}
			const keterOverride = orLayer?.content?.wardrobe;
			if (keterOverride && !allowedWardrobe(keterBible[yesodCastId], keterOverride)) {
				ohrIssues.push({ sceneId: orScene.id, layerId: orLayer.id, code: "WARDROBE_VARIANT", castId: yesodCastId, wardrobe: keterOverride });
			}
		}
	}
	return ohrIssues;
}

function normalizeMember(orMember = {}) {
	return {
		...structuredClone(orMember),
		id: String(orMember.id || ""),
		name: String(orMember.name || orMember.id || "Character"),
		wardrobe: Array.isArray(orMember.wardrobe) ? [...orMember.wardrobe] : [orMember.wardrobe || "default"],
		props: Array.isArray(orMember.props) ? [...orMember.props] : [],
		voice: orMember.voice ? structuredClone(orMember.voice) : null,
		relationships: structuredClone(orMember.relationships || {})
	};
}

function allowedWardrobe(orMember, orWardrobe) {
	return orMember.wardrobe.includes(orWardrobe) || orMember.wardrobe.includes("*");
}
