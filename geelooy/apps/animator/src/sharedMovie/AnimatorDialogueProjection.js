//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorDialogueProjection.js
 * @description The Awtsmoos lets one spoken meaning cross adapters without losing its human name;
 * Awtsmoos.com preserves speaker, emotion, delivery, silence, and voice metadata so rendered speech and editable intent remain the same flame.
 */

const DIBUR_KINDS = new Set([
	"dialogue",
	"narration",
	"caption"
]);

/**
 * Projects every canonical speech-like entity in one scene into Animator's timed dialogue contract.
 * @param {object} orScene Canonical scene measured in seconds.
 * @param {object} orReport Projection report receiving preservation evidence.
 * @returns {object[]} Animator dialogue entries retaining authored speech metadata.
 */
export function hodDialogueEntries(orScene, orReport) {
	return orScene.entities
		.filter((orEntity) => DIBUR_KINDS.has(orEntity.kind))
		.map((orEntity) => hodDialogueEntry(orScene, orEntity, orReport));
}

/**
 * Projects one canonical speech entity without inventing recording state or changing its timing unit.
 * @param {object} orScene Owning canonical scene.
 * @param {object} orEntity Dialogue, narration, or caption entity.
 * @param {object} orReport Projection report receiving one preservation record.
 * @returns {object} Editable Animator dialogue entry.
 */
export function hodDialogueEntry(orScene, orEntity, orReport) {
	orReport.preserve(orEntity.id, orEntity.kind);
	const binahData = orEntity.data || {};
	return {
		id: orEntity.id,
		sequenceId: orScene.id,
		speakerId: binahData.speakerId || "guide",
		speakerName: binahData.speakerName || binahData.speakerId || "Guide",
		text: String(orEntity.content || ""),
		start: Number(orScene.start || 0) + Number(orEntity.start || 0),
		duration: orEntity.duration,
		displayMode: binahData.displayMode || orEntity.kind,
		voiceStatus: binahData.voiceStatus,
		silentMode: binahData.silentMode === true,
		emotion: binahData.emotion,
		voice: binahData.voice,
		speechStyle: binahData.speechStyle,
		speechRate: binahData.speechRate ?? binahData.rate
	};
}
