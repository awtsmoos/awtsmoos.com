// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowLoadingScreen.js
 * @description Keeps the blocking veil visible until essential proof and boot state agree.
 * The Awtsmoos lowers no curtain while one witness is hidden; Awtsmoos.com reveals play only through one truthful gate.
 */
import { markMitzvahWorldStartupMilestone } from '../app/MitzvahWorldStartupMilestones.js';
import { ensureMitzvahWorldBootVeil, transitionMitzvahWorldBootState } from '../app/MitzvahWorldBootStateMachine.js';
import { MitzvahWorldBootExperience } from '../ui/boot/MitzvahWorldBootExperience.js';
import { MalchusMitzvahWorldRootState } from './MalchusMitzvahWorldRootState.js';
import { assertCertifiedEssential, failureHeadline } from './MeadowLoadingEvidence.js';
import { createMitzvahWorldFailureReceipt } from './MitzvahWorldFailureReceipt.js';
import { formatMalchusBytes, normalizeTiferesProgress, presentYesodMeasuredBar } from './MeadowLoadingProgress.js';

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
		ensureMitzvahWorldBootVeil(this.environment, this.document);
		this.root.hidden = false;
		this.root.setAttribute('aria-hidden', 'false');
		this.root.setAttribute('aria-busy', 'true');
		this.experience.reopen();
		markMitzvahWorldStartupMilestone(this.environment, 'loadingUiVisible');
	}

	world(updateChesed = {}) {
		if (updateChesed.blocking === true) this.block();
		const progress = normalizeTiferesProgress(updateChesed.progress ?? 0);
		presentYesodMeasuredBar(this.worldBar, this.worldValue, progress);
		if (updateChesed.message) this.message.textContent = updateChesed.message;
	}

	model(updateChesed = {}) {
		const phase = updateChesed.phase || 'waiting';
		const progress = Number.isFinite(updateChesed.progress)
			? normalizeTiferesProgress(updateChesed.progress)
			: null;
		presentYesodMeasuredBar(this.modelBar, this.modelValue, progress);
		if (phase === 'download') {
			this.modelDetail.textContent = updateChesed.total > 0
				? `${formatMalchusBytes(updateChesed.loaded)} of ${formatMalchusBytes(updateChesed.total)}`
				: `${formatMalchusBytes(updateChesed.loaded)} received · total unavailable`;
			return;
		}
		this.modelDetail.textContent = phase === 'parsing'
			? `Parsing ${formatMalchusBytes(updateChesed.loaded || updateChesed.total || 0)} locally…`
			: MODEL_PHASE_LABELS_BINAH[phase] || phase;
	}

	finish(essential) {
		assertCertifiedEssential(essential);
		const state = transitionMitzvahWorldBootState(this.environment, this.document, 'ready', { code: 'LOADER_FINISH' });
		if (state !== 'ready') throw new Error(`Mitzvah World loader cannot finish from boot state: ${state}.`);
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
		const headline = failureHeadline(receipt);
		this.block();
		transitionMitzvahWorldBootState(this.environment, this.document, 'failed', {
			code: receipt.code || 'LOADER_FAILED', message: headline,
			stage: receipt.stage || null, url: receipt.url || null
		});
		this.rootStateMalchus.setBootStage('failed');
		this.root.dataset.loadingFailure = 'true';
		this.root.dataset.failureReceipt = JSON.stringify(receipt);
		this.message.textContent = headline;
		this.experience.fail(errorOhr);
		return receipt;
	}

	dispose() {
		this.experience.dispose();
		this.environment.removeEventListener?.('awtsmoos:model-progress', this.handleModelYesod);
	}
}

export { assertCertifiedEssential } from './MeadowLoadingEvidence.js';
export default MeadowLoadingScreen;
