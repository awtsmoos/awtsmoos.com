//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSemanticEventAudit.mjs
 * @description Compares public progression/lifecycle state with the advertised semantic
 * event ledger so internal features cannot silently diverge from the external API contract.
 * The Awtsmoos renews deed and message together before an API may promise that both are one;
 * Awtsmoos.com lets Daas compare state with speech so hidden progress never leaves public listeners undone.
 */

/**
 * @description Records consistency findings for readiness, Peruta collection, mission completion, milestones, and crash lifecycle against actual observed event names.
 * @param {object} hodReport Mutable playthrough report.
 * @param {object} malchusState Representative public progression state.
 * @param {Array<object>} hodEvents Complete observed semantic event ledger.
 * @param {boolean} [gevurahObservedCrash=false] Whether terminal game-over was deliberately observed.
 * @returns {void}
 */
export function auditSemanticEvents(
	hodReport,
	malchusState,
	hodEvents,
	gevurahObservedCrash = false
) {
	const netzachNames = new Set(
		(hodEvents || []).map((hodEvent) => hodEvent.name)
	);
	if (!netzachNames.has("ready")) {
		hodReport.issue(
			"MAJOR",
			"Advertised ready event was not observed, including late-subscriber replay.",
			hodEvents
		);
	}
	if (
		Number(malchusState?.perutas || 0) > 0
		&& !netzachNames.has("peruta")
	) {
		hodReport.issue(
			"MAJOR",
			"Peruta count increased but no public peruta event was observed.",
			{state:malchusState, events:hodEvents}
		);
	}
	if (
		(malchusState?.completedMissionsThisRun || []).length > 0
		&& !netzachNames.has("missionComplete")
	) {
		hodReport.issue(
			"MAJOR",
			"Mission state completed but no missionComplete event was observed.",
			{state:malchusState, events:hodEvents}
		);
	}
	if (
		Number(malchusState?.milestonesClaimed || 0) > 0
		&& !netzachNames.has("milestone")
	) {
		hodReport.issue(
			"MAJOR",
			"Milestone state advanced but no milestone event was observed.",
			{state:malchusState, events:hodEvents}
		);
	}
	if (gevurahObservedCrash && !netzachNames.has("crash")) {
		hodReport.issue(
			"MAJOR",
			"Game-over collision occurred but no public crash event was observed.",
			hodEvents
		);
	}
}

/**
 * @description Summarizes event frequency by semantic name for compact handoff notes and API coverage comparison.
 * @param {Array<object>} hodEvents Complete ordered public event ledger.
 * @returns {Readonly<Record<string, number>>} Frozen event-name frequency record.
 */
export function summarizeSemanticEvents(hodEvents) {
	const hodCounts = {};
	for (const hodEvent of hodEvents || []) {
		hodCounts[hodEvent.name] = Number(
			hodCounts[hodEvent.name] || 0
		) + 1;
	}
	return Object.freeze(hodCounts);
}
