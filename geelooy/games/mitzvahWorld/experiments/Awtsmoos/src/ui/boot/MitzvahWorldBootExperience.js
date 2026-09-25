// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootExperience.js
 * @description Observes essential readiness at a calm cadence and turns it into one cinematic, truthful boot story.
 * The Awtsmoos gives every waiting instant a fresh beginning while Awtsmoos.com refuses to decorate uncertainty as success;
 * this view listens, reflects, and then disappears, leaving the meadow itself to become the final luminous interface.
 */

import { getMitzvahWorldEssentialBootSnapshot } from '../../app/MitzvahWorldEssentialBoot.js';
import {
	countCompletedMitzvahWorldMilestones,
	formatMitzvahWorldBootEvidence,
	renderMitzvahWorldBootMilestones
} from './MitzvahWorldBootMilestones.js';

const REFRESH_MS = 125;

export class MitzvahWorldBootExperience {
	constructor(documentKli, environmentKli = globalThis) {
		this.document = documentKli;
		this.environment = environmentKli;
		this.root = documentKli.getElementById('menuBoot');
		this.gateState = documentKli.getElementById('bootGateState');
		this.stageLabel = documentKli.getElementById('bootStageLabel');
		this.stageMeta = documentKli.getElementById('bootStageMeta');
		this.evidence = documentKli.getElementById('bootEvidence');
		this.evidenceText = documentKli.getElementById('bootEvidenceText');
		this.timer = null;
	}

	start() {
		if (!this.root || this.timer) return;
		this.render();
		this.timer = this.environment.setInterval?.(() => this.render(), REFRESH_MS) || null;
		this.timer?.unref?.();
	}

	reopen() {
		if (this.root) this.root.dataset.essentialState = 'verifying';
		this.start();
	}

	complete() {
		this.render();
		if (this.root) this.root.dataset.essentialState = 'complete';
		this.stop();
	}

	fail(errorOhr) {
		this.render();
		if (this.root) this.root.dataset.essentialState = 'failed';
		if (this.evidence && this.evidenceText && !this.evidenceText.textContent) {
			this.evidence.hidden = false;
			this.evidenceText.textContent = `Failure: ${errorOhr?.message || String(errorOhr)}`;
		}
		this.stop();
	}

	render() {
		if (!this.root) return;
		const snapshot = getMitzvahWorldEssentialBootSnapshot(this.environment);
		renderMitzvahWorldBootMilestones(this.document, snapshot);
		const focus = snapshot.stalledMilestone || snapshot.activeMilestone;
		const completed = countCompletedMitzvahWorldMilestones(snapshot);
		this.root.dataset.essentialState = snapshot.stalledMilestone ? 'failed' : snapshot.certified ? 'complete' : 'verifying';
		if (this.gateState) this.gateState.textContent = snapshot.certified ? 'Essential gate proved' : `${completed} / 5 proved`;
		if (this.stageLabel) this.stageLabel.textContent = focus?.label || (snapshot.certified ? 'First play is ready' : 'Preparing essential capability');
		if (this.stageMeta) this.stageMeta.textContent = focus ? stageMeta(focus) : 'Five essential proofs · five-second gate';
		this.renderEvidence(snapshot.stalledMilestone);
	}

	renderEvidence(record) {
		if (!this.evidence || !this.evidenceText) return;
		const text = formatMitzvahWorldBootEvidence(record);
		this.evidence.hidden = !text;
		this.evidenceText.textContent = text;
	}

	stop() {
		if (this.timer) this.environment.clearInterval?.(this.timer);
		this.timer = null;
	}

	dispose() {
		this.stop();
	}
}

function stageMeta(record) {
	const elapsed = Number.isFinite(record?.elapsedMilliseconds) ? `${Math.round(record.elapsedMilliseconds)} ms` : 'measuring';
	return `${record?.status === 'pending' ? 'Verifying' : record?.status} · ${elapsed}`;
}
