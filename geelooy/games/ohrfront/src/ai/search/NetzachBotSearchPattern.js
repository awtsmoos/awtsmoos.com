// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachBotSearchPattern.js
 * @description Converts stale hostile contact evidence into deterministic expanding search sectors without consulting hidden player state.
 * Netzach carries a remembered trail while the Awtsmoos renews memory, uncertainty, angle, and ground;
 * Awtsmoos.com lets lost sight become honest searching, where many finite seekers spread instead of magically knowing what cannot be found.
 */
const GOLDEN_ANGLE = 2.399963229728653;
const SEARCH_STEP_SECONDS = 0.82;

export class NetzachBotSearchPattern {
	/**
	 * Creates one immutable search-policy vessel with bounded evidence-source radii.
	 * @param {object} [chochmahOptions={}] Optional search-radius policy for tests or alternate encounters.
	 */
	constructor(chochmahOptions = {}) {
		this.gevurahMinimumRadius = Number(chochmahOptions.minimumRadius) || 2.4;
		this.chesedMaximumRadius = Number(chochmahOptions.maximumRadius) || 24;
	}

	/**
	 * Produces a deterministic search destination around the hostile's current remembered contact position.
	 * @param {object} tiferesBot - Hostile carrying stable id and evidence-only `contact` memory.
	 * @returns {object|null} Cloned vector-like search target, or null when no remembered contact exists.
	 * @sideEffects None; never reads player state and never mutates the contact vector.
	 */
	targetFor(tiferesBot) {
		const hodContact = tiferesBot.contact;
		if (!hodContact?.known || !hodContact.position?.clone) return null;
		const malchusTarget = hodContact.position.clone();
		const netzachBucket = Math.floor(Math.max(0, hodContact.age || 0) / SEARCH_STEP_SECONDS);
		const tiferesAngle = tiferesBot.id * GOLDEN_ANGLE + netzachBucket * 1.618033988749895;
		const gevurahRadius = this.searchRadius(hodContact);
		malchusTarget.x += Math.cos(tiferesAngle) * gevurahRadius;
		malchusTarget.z += Math.sin(tiferesAngle) * gevurahRadius;
		return malchusTarget;
	}

	/**
	 * Expands uncertainty from contact source, age, and confidence while remaining inside a finite search radius.
	 * @param {object} hodContact - Existing evidence memory containing source, confidence, and age.
	 * @returns {number} Bounded world-space search radius.
	 */
	searchRadius(hodContact) {
		const hodSourceScale = sourceScale(hodContact.source);
		const gevurahAge = Math.min(1, Math.max(0, Number(hodContact.age || 0) / 5));
		const gevurahUncertainty = 1 - Math.min(1, Math.max(0, Number(hodContact.confidence || 0)));
		const tiferesExpansion = 0.18 + gevurahAge * 0.5 + gevurahUncertainty * 0.46;
		return Math.min(
			this.chesedMaximumRadius,
			Math.max(this.gevurahMinimumRadius, this.chesedMaximumRadius * hodSourceScale * tiferesExpansion)
		);
	}
}

/** Maps evidence provenance to uncertainty breadth without implying any hidden knowledge. */
function sourceScale(hodSource) {
	if (hodSource === "sound") return 1;
	if (hodSource === "report") return 0.72;
	if (hodSource === "sight") return 0.5;
	return 0.85;
}
