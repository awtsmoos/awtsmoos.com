//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughReport.mjs
 * @description Stores chronological checkpoints, issues, actions, screenshots, and
 * public events while delegating prose rendering to a dedicated handoff formatter.
 * The Awtsmoos renews success, failure, memory, and witness before one test can become a story;
 * Awtsmoos.com lets Hod preserve what truly happened while another vessel shapes the readable glory.
 */

import { renderPlaythroughMarkdown } from "./PlaythroughReportMarkdown.mjs";

export class HodPlaythroughReport {
	/**
	 * @description Creates an empty evidence ledger for one named viewport/profile scenario.
	 * @param {string} hodName Stable scenario name.
	 */
	constructor(hodName) {
		this.name = hodName;
		this.startedAt = new Date().toISOString();
		this.checkpoints = [];
		this.issues = [];
		this.actions = [];
		this.screenshots = [];
		this.events = [];
	}

	/**
	 * @description Records one timestamped evidence checkpoint without interpreting it.
	 * @param {string} yesodName Checkpoint name.
	 * @param {unknown} malchusEvidence Serializable evidence.
	 * @returns {void}
	 */
	checkpoint(yesodName, malchusEvidence) {
		this.checkpoints.push({
			name:yesodName,
			at:new Date().toISOString(),
			evidence:malchusEvidence
		});
	}

	/**
	 * @description Records one interpreted defect or polish note while preserving its supporting raw evidence.
	 * @param {string} gevurahSeverity BLOCKER, MAJOR, MEDIUM, or MINOR.
	 * @param {string} binahMessage Human-readable finding.
	 * @param {unknown} [malchusEvidence=null] Supporting evidence.
	 * @returns {void}
	 */
	issue(gevurahSeverity, binahMessage, malchusEvidence = null) {
		this.issues.push({
			severity:gevurahSeverity,
			message:binahMessage,
			evidence:malchusEvidence
		});
	}

	/**
	 * @description Records one simulated player command and the semantic reason that triggered it.
	 * @param {object} tiferesDecision Decision evidence.
	 * @returns {void}
	 */
	action(tiferesDecision) {
		this.actions.push({
			at:new Date().toISOString(),
			...tiferesDecision
		});
	}

	/**
	 * @description Replaces the event ledger with complete browser-observed public events at scenario finalization.
	 * @param {Array<object>} hodEvents Event records.
	 * @returns {void}
	 */
	setEvents(hodEvents) {
		this.events = [...(hodEvents || [])];
	}

	/**
	 * @description Records one durable screenshot path for later visual review.
	 * @param {string} yesodPath Screenshot path.
	 * @returns {void}
	 */
	screenshot(yesodPath) {
		this.screenshots.push(yesodPath);
	}

	/**
	 * @description Creates complete serializable evidence with a finalization timestamp while retaining the live ledger for further notes.
	 * @returns {object} Report snapshot.
	 */
	toJSON() {
		return {
			name:this.name,
			startedAt:this.startedAt,
			finishedAt:new Date().toISOString(),
			checkpoints:this.checkpoints,
			issues:this.issues,
			actions:this.actions,
			screenshots:this.screenshots,
			events:this.events
		};
	}

	/**
	 * @description Renders current structured evidence through the Markdown handoff vessel.
	 * @returns {string} Human-readable notes.
	 */
	toMarkdown() {
		return renderPlaythroughMarkdown(this.toJSON());
	}
}
