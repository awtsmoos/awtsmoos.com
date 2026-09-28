//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MeadowLoadingScreen.js
 * @description Coordinates the blocking boot veil, measured resources, authored Chossid progress, essential proof, and structured failure truth.
 * The Awtsmoos lets Awtsmoos.com raise one truthful curtain before network work and lower it only after witnessed first play;
 * measured bytes remain measured, failures remain exact, and neither may impersonate readiness along the way.
 */

import { markMitzvahWorldStartupMilestone } from '../app/MitzvahWorldStartupMilestones.js';
import { MitzvahWorldBootExperience } from '../ui/boot/MitzvahWorldBootExperience.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { createMitzvahWorldFailureReceipt } from './MitzvahWorldFailureReceipt.js';
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
		this.experience = new MitzvahWorldBootExperience(documentKli, environmentKli);
		this.handleModelYesod = eventOhr => this.model(eventOhr.detail || {});
		environmentKli.addEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
		this.block();
		this.world({ message: 'Preparing the visible meadow…', progress: 0 });
		this.model({ phase: 'waiting', progress: 0 });
	}

	block() {
		this.rootStateMalchus.setFlag('menuReady', false);
		delete this.root.dataset.loadingComplete;
		delete this.root.dataset.loadingFailure;
		delete this.root.dataset.failureReceipt;
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.root.setAttribute('aria-busy', 'true');
		this.experience.reopen();
		markMitzvahWorldStartupMilestone(this.environment, 'loadingUiVisible');
	}

	world(updateChesed = {}) {
		if (updateChesed.blocking === true) this.block();
		const progressTiferes = normalizeTiferesProgress(updateChesed.progress ?? 0);
		presentYesodMeasuredBar(this.worldBar, this.worldValue, progressTiferes);
		if (updateChesed.message) this.message.textContent = updateChesed.message;
	}

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

	finish() {
		this.world({ message: 'Essential world ready.', progress: 1 });
		this.experience.complete();
		this.rootStateMalchus.setFlag('menuReady', true);
		this.root.dataset.loadingComplete = 'true';
		this.root.hidden = true;
		this.root.setAttribute('aria-hidden', 'true');
		this.root.setAttribute('aria-busy', 'false');
		markMitzvahWorldStartupMilestone(this.environment, 'loadingUiDismissed');
		this.dispose();
	}

	fail(errorOhr) {
		const receipt = createMitzvahWorldFailureReceipt(errorOhr);
		this.block();
		this.rootStateMalchus.setBootStage('failed');
		this.root.dataset.loadingFailure = 'true';
		this.root.dataset.failureReceipt = JSON.stringify(receipt);
		this.message.textContent = failureHeadline(receipt);
		this.experience.fail(errorOhr);
		return receipt;
	}

	dispose() {
		this.experience.dispose();
		this.environment.removeEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
	}
}

function failureHeadline(receipt) {
	const unmet = receipt.unmetConditions?.[0] || receipt.code;
	return `Playable meadow blocked · ${unmet}`;
}

export default MeadowLoadingScreen;
