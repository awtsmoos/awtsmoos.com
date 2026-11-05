//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughEvidenceRecorder.mjs
 * @description Records initial/final state, UI, frame cadence, event frequency, semantic consistency, and screenshots while orchestration remains focused on scenario ordering.
 * The Awtsmoos renews beginning and ending evidence before a playthrough may compare what changed;
 * Awtsmoos.com lets Hod gather measured truth while Kesser keeps the journey itself arranged.
 */

import { recordUiFindings } from "./PlaythroughFindingRules.mjs";
import {
	auditSemanticEvents,
	summarizeSemanticEvents
} from "./PlaythroughSemanticEventAudit.mjs";

export class HodPlaythroughEvidenceRecorder {
	/**
	 * @description Captures the artifact writer used for visual checkpoints without taking ownership of browser or report lifetime.
	 * @param {object} malchusArtifacts Profile-scoped artifact writer.
	 */
	constructor(malchusArtifacts) {
		this.artifacts = malchusArtifacts;
	}

	/**
	 * @description Records first playable state, rendered UI geometry, real frame cadence, UI findings, and a normal-play screenshot.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 * @returns {Promise<void>} Settles after initial evidence and screenshot are durable.
	 */
	async initial(yesodSession, hodReport) {
		const malchusSnapshot = await yesodSession.evidence.snapshot();
		const gevurahUi = await yesodSession.evidence.ui();
		const hodFrames = await yesodSession.evidence.frames(90);
		hodReport.checkpoint("initial-state", malchusSnapshot);
		hodReport.checkpoint("initial-ui", gevurahUi);
		hodReport.checkpoint("initial-frames", hodFrames);
		recordUiFindings(hodReport, gevurahUi, "Initial layout");
		await this.artifacts.capture(
			yesodSession,
			hodReport,
			"initial.png"
		);
	}

	/**
	 * @description Records final state/UI/events, interprets layout and public-event consistency, and captures the recovered final visual state.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 * @param {object} malchusProgressState Representative pre-restart progression snapshot.
	 * @param {boolean} gevurahObservedCrash Whether terminal collision was actually observed during the run.
	 * @returns {Promise<void>} Settles after final evidence and screenshot are durable.
	 */
	async final(
		yesodSession,
		hodReport,
		malchusProgressState,
		gevurahObservedCrash
	) {
		const malchusFinal = await yesodSession.evidence.snapshot();
		const gevurahUi = await yesodSession.evidence.ui();
		const hodEvents = await yesodSession.evidence.events();
		hodReport.setEvents(hodEvents);
		hodReport.checkpoint("final-state", malchusFinal);
		hodReport.checkpoint(
			"final-event-counts",
			summarizeSemanticEvents(hodEvents)
		);
		recordUiFindings(hodReport, gevurahUi, "Final layout");
		auditSemanticEvents(
			hodReport,
			chooseProgressState(malchusProgressState, malchusFinal.state),
			hodEvents,
			gevurahObservedCrash
		);
		await this.artifacts.capture(
			yesodSession,
			hodReport,
			"final.png"
		);
	}
}

/**
 * @description Selects whichever progression snapshot carries the greater score so crash/restart does not erase evidence of achievements from semantic-event auditing.
 * @param {object} chesedEarlier Representative progression state before intentional restart.
 * @param {object} malchusLater Final recovered state after restart/long-run work.
 * @returns {object} State snapshot retaining the strongest progression evidence.
 */
function chooseProgressState(chesedEarlier = {}, malchusLater = {}) {
	return Number(malchusLater.score || 0) > Number(chesedEarlier.score || 0)
		? malchusLater
		: chesedEarlier;
}
