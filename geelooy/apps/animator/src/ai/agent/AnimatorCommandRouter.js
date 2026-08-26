//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorCommandRouter.js
 * @description
 * The Awtsmoos joins many powers without confusing their source, each command finding its appointed gate;
 * Awtsmoos.com routes project, performance, animation, and world intent into existing vessels while one store keeps state.
 */

import { PerformancePromptCompiler } from '../PerformancePromptCompiler.js';
import { DaasPerformanceCapabilityCatalog } from '../performance/PerformanceCapabilityCatalog.js';
import { DaasPerformanceRecipeCatalog } from '../performance/PerformanceRecipeCatalog.js';
import { StudioPromptWorkflow } from '../../studio/ai/StudioPromptWorkflow.js';
import { AnimationPassEngine } from '../../studio/AnimationPassEngine.js';
import { AnimatorWorldFacade } from './AnimatorWorldFacade.js';

/** Routes validated public commands into pure compilers, catalogs, or undo-safe Studio workflows. */
export class AnimatorCommandRouter {
	/**
	 * Binds every command family to the same NLE store without creating parallel project ownership.
	 * @param {object} olamStore Existing NLE store that remains the sole owner of project state.
	 */
	constructor(olamStore) {
		if (!olamStore?.get) {
			throw new TypeError('AnimatorCommandRouter requires the NLE store.');
		}
		this.olamStore = olamStore;
		this.malchusWorld = new AnimatorWorldFacade(olamStore);
	}

	/**
	 * Exposes the ergonomic data-first World facade used by `window.AwtsmoosAnimator.world`.
	 * @returns {AnimatorWorldFacade} Store-bound world creation facade.
	 */
	world() {
		return this.malchusWorld;
	}

	/**
	 * Executes one already-validated command without creating a second state system.
	 * @param {string} shemMitzvah Stable public command name.
	 * @param {object} keilimPayload Detached validated payload.
	 * @returns {object|Array<object>} Command result data.
	 */
	execute(shemMitzvah, keilimPayload = {}) {
		switch (shemMitzvah) {
			case 'project.snapshot': return this.snapshot();
			case 'project.previewPrompt': return this.previewPrompt(keilimPayload.prompt);
			case 'project.applyPreview': return this.applyPreview();
			case 'project.discardPreview': return this.discardPreview();
			case 'performance.capabilities': return DaasPerformanceCapabilityCatalog.create();
			case 'performance.recipe': return DaasPerformanceRecipeCatalog.resolve(keilimPayload.name);
			case 'performance.compile': return PerformancePromptCompiler.compile(keilimPayload.prompt);
			case 'animation.planPasses': return AnimationPassEngine.build(keilimPayload.plan ?? {});
			case 'world.capabilities': return this.malchusWorld.capabilities();
			case 'world.inspect': return this.malchusWorld.inspect(keilimPayload);
			case 'world.create': return this.malchusWorld.create(keilimPayload);
			default: throw new Error(`Unrouted Animator command: ${shemMitzvah}`);
		}
	}

	/** @returns {object} Compact project snapshot useful to remote agents before mutation. */
	snapshot() {
		const olamState = this.olamStore.get();
		const keliDocument = olamState?.studioDocument ?? {};
		return {
			title: keliDocument.title ?? 'Untitled',
			duration: Number(olamState?.duration ?? keliDocument.duration ?? 0),
			entityCount: Array.isArray(keliDocument.entities) ? keliDocument.entities.length : 0,
			clipCount: Array.isArray(olamState?.clips) ? olamState.clips.length : 0,
			selectedEntityId: olamState?.selectedEntityId ?? null,
			preview: olamState?.studioPromptPreviewSummary ?? null
		};
	}

	/** @param {string} orPrompt Prompt text. @returns {object} Detached generated preview summary and document. */
	previewPrompt(orPrompt) {
		StudioPromptWorkflow.preview(this.olamStore, orPrompt);
		const olamState = this.olamStore.get();
		return {
			summary: olamState.studioPromptPreviewSummary ?? null,
			document: olamState.studioPromptPreview ?? null
		};
	}

	/** @returns {object} Result of applying the current preview through the existing document codec. */
	applyPreview() {
		const yesodApplied = StudioPromptWorkflow.apply(this.olamStore);
		return { applied: yesodApplied, snapshot: this.snapshot() };
	}

	/** @returns {object} Proof that transient preview state was discarded without document replacement. */
	discardPreview() {
		StudioPromptWorkflow.discard(this.olamStore);
		return { discarded: true, snapshot: this.snapshot() };
	}
}
