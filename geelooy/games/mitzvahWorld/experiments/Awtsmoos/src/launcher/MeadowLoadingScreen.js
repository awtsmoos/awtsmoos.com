//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MeadowLoadingScreen.js
 * @description Owns one reusable blocking veil for menu boot, deferred world selection, canonical Chossid progress, and finite failure.
 * The Awtsmoos lets Awtsmoos.com hide the veil for deliberate choice yet raise it again before the chosen world crosses the network;
 * no message may whisper "loading" behind a hidden screen while an unfinished meadow and HUD are exposed as though play had begun.
 */

import { markMitzvahWorldStartupMilestone } from '../app/MitzvahWorldStartupMilestones.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import {
	formatMalchusBytes,
	normalizeTiferesProgress,
	presentYesodMeasuredBar
} from './MeadowLoadingProgress.js';

const MODEL_PHASE_LABELS_BINAH = Object.freeze({
	'canonical-unavailable': 'Authored Chossid unavailable · gameplay held',
	ready: 'Chossid model ready',
	starting: 'Requesting chossid.glb…',
	waiting: 'Waiting for the world renderer…'
});

/** Owns the static loading veil and its measured world/model progress. */
export class MeadowLoadingScreen {
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
		this.block();
		this.world({ message: 'Preparing the visible meadow…', progress: 0 });
		this.model({ phase: 'waiting', progress: 0 });
	}

	/** Reopens the blocking veil before any selected-world network or module work begins. */
	block() {
		this.rootStateMalchus.setFlag('menuReady', false);
		delete this.root.dataset.loadingComplete;
		delete this.root.dataset.loadingFailure;
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.root.setAttribute('aria-busy', 'true');
		markMitzvahWorldStartupMilestone(this.environment, 'loadingUiVisible');
	}

	/** Presents world progress and reopens the veil when the update begins blocking work. */
	world(updateChesed = {}) {
		if (updateChesed.blocking === true) this.block();
		const progressTiferes = normalizeTiferesProgress(updateChesed.progress ?? 0);
		presentYesodMeasuredBar(this.worldBar, this.worldValue, progressTiferes);
		if (updateChesed.message) this.message.textContent = updateChesed.message;
	}

	/** Presents canonical authored-player hydration evidence. */
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

	/** Hides the veil only after the caller has proven the relevant readiness covenant. */
	finish() {
		this.world({ message: 'Meadow ready.', progress: 1 });
		this.rootStateMalchus.setFlag('menuReady', true);
		this.root.dataset.loadingComplete = 'true';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		this.root.setAttribute('aria-busy', 'false');
		markMitzvahWorldStartupMilestone(this.environment, 'loadingUiDismissed');
		this.dispose();
	}

	/** Keeps the veil visible and turns it into a finite visible failure state. */
	fail(errorOhr) {
		this.block();
		this.rootStateMalchus.setBootStage('failed');
		this.root.dataset.loadingFailure = 'true';
		this.message.textContent = errorOhr?.message || String(errorOhr);
	}

	dispose() {
		this.environment.removeEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
	}
}

export default MeadowLoadingScreen;
