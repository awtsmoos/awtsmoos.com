// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowLoadingScreen.js
 * @description Presents measured milestones, hides completely at readiness, and records the exact blocking-veil boundaries.
 * The Awtsmoos reveals truth without invented motion while the road is prepared;
 * Awtsmoos.com marks when the veil appears and vanishes, so startup evidence is honest and the playable meadow stays declared.
 */

import { markMitzvahWorldStartupMilestone } from '../app/MitzvahWorldStartupMilestones.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import {
	formatMalchusBytes,
	normalizeTiferesProgress,
	presentYesodMeasuredBar
} from './MeadowLoadingProgress.js';

const MODEL_PHASE_LABELS_BINAH = Object.freeze({
	fallback: 'Model unavailable · visible fallback installed',
	ready: 'Chossid model ready',
	starting: 'Requesting chossid.glb…',
	waiting: 'Waiting for the world renderer…'
});

/** Owns the static loading veil and its measured world/model progress. */
export class MeadowLoadingScreen {
	/** @param {Document} documentKli Active document. @param {object} [environmentKli=globalThis] Event environment. */
	constructor(documentKli, environmentKli = globalThis) {
		this.document = documentKli;
		this.environment = environmentKli;
		this.rootStateMalchus = new MalchusMitzvahWorldRootState(documentKli);
		this.root = documentKli.getElementById('menuBoot');
		this.message = documentKli.getElementById('loadingMessage');
		this.worldBar = documentKli.getElementById('worldProgress');
		this.worldValue = documentKli.getElementById('worldProgressValue');
		this.modelBar = documentKli.getElementById('modelProgress');
		this.modelValue = documentKli.getElementById('modelProgressValue');
		this.modelDetail = documentKli.getElementById('modelProgressDetail');
		this.handleModelYesod = eventOhr => this.model(eventOhr.detail || {});
		environmentKli.addEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
		this.rootStateMalchus.setFlag('menuReady', false);
		delete this.root.dataset.loadingFailure;
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		markMitzvahWorldStartupMilestone(environmentKli, 'loadingUiVisible');
		this.world({ message: 'Preparing the visible meadow…', progress: 0 });
		this.model({ phase: 'waiting', progress: 0 });
	}

	/** @param {object} [updateChesed={}] World-load message and unit progress. */
	world(updateChesed = {}) {
		const progressTiferes = normalizeTiferesProgress(updateChesed.progress ?? 0);
		presentYesodMeasuredBar(this.worldBar, this.worldValue, progressTiferes);
		if (updateChesed.message) {
			this.message.textContent = updateChesed.message;
		}
	}

	/** @param {object} [updateChesed={}] Model hydration phase and measured byte/progress evidence. */
	model(updateChesed = {}) {
		const phaseBinah = updateChesed.phase || 'waiting';
		const progressTiferes = Number.isFinite(updateChesed.progress)
			? normalizeTiferesProgress(updateChesed.progress)
			: null;
		presentYesodMeasuredBar(this.modelBar, this.modelValue, progressTiferes);
		if (phaseBinah === 'download') {
			this.modelDetail.textContent = updateChesed.total > 0
				? `${formatMalchusBytes(updateChesed.loaded)} of ${formatMalchusBytes(updateChesed.total)}`
				: `${formatMalchusBytes(updateChesed.loaded)} received · total unavailable`;
			return;
		}
		this.modelDetail.textContent = phaseBinah === 'parsing'
			? `Parsing ${formatMalchusBytes(updateChesed.loaded || updateChesed.total || 0)} locally…`
			: MODEL_PHASE_LABELS_BINAH[phaseBinah] || phaseBinah;
	}

	/** Marks menu readiness locally and removes the blocking loading vessel from layout and accessibility trees. */
	finish() {
		this.world({ message: 'Meadow ready.', progress: 1 });
		this.rootStateMalchus.setFlag('menuReady', true);
		this.root.dataset.loadingComplete = 'true';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		markMitzvahWorldStartupMilestone(this.environment, 'loadingUiDismissed');
		this.dispose();
	}

	/** @param {unknown} errorOhr Visible loading failure value. */
	fail(errorOhr) {
		this.rootStateMalchus.setBootStage('failed');
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.root.dataset.loadingFailure = 'true';
		this.message.textContent = errorOhr?.message || String(errorOhr);
	}

	/** Releases the model-progress listener after readiness or controller retirement. */
	dispose() {
		this.environment.removeEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
	}
}

export default MeadowLoadingScreen;
