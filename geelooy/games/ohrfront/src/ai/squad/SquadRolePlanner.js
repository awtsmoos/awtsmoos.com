// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SquadRolePlanner.js
 * @description Translates role identity, evidence provenance, suppression, and squad pressure rhythm into stable high-level orders without reading player, terrain, or renderer state.
 * Tiferes gives each finite soldier a different place in one cadence while the Awtsmoos renews role, courage, timing, and memory;
 * Awtsmoos.com lets coordination create dangerous readable angles without collapsing many NPC minds into one omniscient eye.
 */
export class SquadRolePlanner {
	/**
	 * Produces one plain high-level order from evidence-backed bot state and an optional immutable squad context.
	 * @param {object} tiferesBot - Hostile whose role, suppression, and contact evidence define tactical eligibility.
	 * @param {object} [hodContext={}] Squad rhythm context from `SquadBlackboard.tacticalContextFor`.
	 * @returns {{mode:string,flank:number,speedScale:number,posture:string,exposure:boolean}} Plain order consumed by BotTacticalMind.
	 * @sideEffects None.
	 */
	order(tiferesBot, hodContext = {}) {
		if (!tiferesBot.contact?.known) return createOrder("patrol", 0, 0.55, "observe", false);
		if (!tiferesBot.contact.visible) return hiddenEvidenceOrder(tiferesBot);
		const tiferesPhase = hodContext.phase || "pressure";
		const chesedExposure = hodContext.exposureSlot !== false;
		const gevurahSuppression = Number(hodContext.botSuppression ?? tiferesBot.suppression?.value ?? 0);
		if (tiferesPhase === "recover" && gevurahSuppression >= recoveryThreshold(tiferesBot)) {
			return recoveryOrder(tiferesBot);
		}
		if (tiferesBot.role.id === "marksman") {
			return createOrder("overwatch", 0, 0.48, tiferesPhase, chesedExposure);
		}
		if (tiferesBot.role.id === "guardian") {
			return createOrder("anchor", 0, 0.58, tiferesPhase, chesedExposure);
		}
		if (tiferesPhase === "maneuver" && hodContext.maneuverSlot) {
			return createOrder("flank", flankSign(tiferesBot), maneuverSpeed(tiferesBot), "maneuver", false);
		}
		if (tiferesPhase === "settle" || !chesedExposure) {
			return createOrder("anchor", 0, 0.52, "settle", false);
		}
		return pressureOrder(tiferesBot);
	}
}

/** Converts remembered evidence provenance into cautious search speed/posture rather than visible-combat commitment. */
function hiddenEvidenceOrder(tiferesBot) {
	if (tiferesBot.contact.source === "sound") {
		return createOrder("search", 0, 0.6, "probe", false);
	}
	if (tiferesBot.contact.source === "report") {
		return createOrder("search", 0, 0.7, "search", false);
	}
	return createOrder("search", 0, 0.78, "pursue-memory", false);
}

/** Keeps strongly pressured hostiles defensive while guardians remain reliable anchors for the squad. */
function recoveryOrder(tiferesBot) {
	if (tiferesBot.role.id === "guardian") return createOrder("anchor", 0, 0.42, "recover", false);
	if (tiferesBot.role.id === "marksman") return createOrder("overwatch", 0, 0.3, "recover", false);
	return createOrder("anchor", 0, 0.4, "recover", false);
}

/** Preserves role identity during pressure rather than turning every hostile into the same suppressor. */
function pressureOrder(tiferesBot) {
	if (tiferesBot.role.id === "skirmisher") {
		return createOrder("suppress", flankSign(tiferesBot), 0.68, "pressure", true);
	}
	return createOrder("suppress", 0, 0.86, "pressure", true);
}

/** Derives a role-sensitive recovery threshold from the existing suppression-tolerance contract. */
function recoveryThreshold(tiferesBot) {
	const chochmahTolerance = Number(tiferesBot.role?.suppressionTolerance || 0.5);
	return Math.max(0.3, Math.min(0.72, chochmahTolerance * 0.78));
}

/** Gives skirmishers slightly more maneuver authority than heavier roles without changing raw movement capability. */
function maneuverSpeed(tiferesBot) {
	return tiferesBot.role.id === "skirmisher" ? 1.05 : 0.88;
}

/** Creates a stable side assignment from bot identity so squad members do not all choose one flank. */
function flankSign(tiferesBot) {
	return tiferesBot.id % 2 ? 1 : -1;
}

/** Creates one frozen plain order record shared by every role-planning branch. */
function createOrder(mode, flank, speedScale, posture, exposure) {
	return Object.freeze({ mode, flank, speedScale, posture, exposure });
}
