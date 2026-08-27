// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTextureDomain.js
 * @description
 * The Awtsmoos lets authored 2D form become runtime texture, atlas plan, or animated bake plan while GPU handles remain hidden below;
 * Awtsmoos.com keeps every public result JSON-safe so agents can direct texture work without becoming owners of disposable glow.
 */

import { BinahTextureAtlasPlanner } from '../../../renderable/atlas/TextureAtlasPlanner.js';
import { YesodTextureRecipe } from '../../../renderable/model/TextureRecipe.js';
import { YesodStudioEntityTexturePipeline } from '../../../renderable/runtime/StudioEntityTexturePipeline.js';

/** Adapts universal texture planning and live realization into JSON-safe Agent API results. */
export class YesodAnimatorTextureDomain {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Live Animator runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusStore = malchusStore;
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Texture capability report independent from private handles. */
	capabilities() {
		const keterRenderRuntime = this.renderRuntime(false);
		return {
			universalDrawableEligibility: true,
			runtimeAvailable: Boolean(keterRenderRuntime?.gl),
			privateHandles: true,
			qualityPolicies: ['draft', 'preview', 'production', 'retina', 'adaptive'],
			activationPolicies: ['on-demand', 'live', 'baked'],
			updatePolicies: ['revision', 'dirty-region', 'every-frame', 'manual']
		};
	}

	/** @param {object} keliRecipe Candidate recipe. @returns {object} Normalized durable recipe. */
	recipe(keliRecipe = {}) {
		return YesodTextureRecipe.normalize(keliRecipe);
	}

	/** @param {string} sodObjectId Studio entity ID. @param {object} keilimOptions Realization options. @returns {object} JSON-safe realization receipt. */
	prepare(sodObjectId, keilimOptions = {}) {
		const keliDocument = this.document();
		const keliEntity = this.entity(sodObjectId, keliDocument);
		const yesodPipeline = new YesodStudioEntityTexturePipeline(
			this.renderRuntime(true)
		);
		const keliRuntimeResult = yesodPipeline.realize(
			keliEntity,
			keliDocument,
			keilimOptions
		);
		return {
			objectId: sodObjectId,
			key: keliRuntimeResult.key,
			width: keliRuntimeResult.width,
			height: keliRuntimeResult.height,
			bytes: keliRuntimeResult.bytes,
			uploaded: Boolean(keliRuntimeResult.uploaded),
			status: this.stats()
		};
	}

	/** @returns {object} JSON-safe runtime texture statistics. */
	stats() {
		const keterRenderRuntime = this.renderRuntime(false);
		return keterRenderRuntime
			? keterRenderRuntime.status()
			: {
				capabilities: { available: false },
				memory: { entries: 0, bytes: 0, budgetBytes: 0, utilization: 0, pinned: 0 },
				lifecycle: { lost: false, recovery: 'unavailable' },
				representations: []
			};
	}

	/** @returns {object} Post-release texture runtime status. */
	releaseAll() {
		const keterRenderRuntime = this.renderRuntime(true);
		keterRenderRuntime.release();
		return this.stats();
	}

	/** @param {object[]} sederItems Atlas items. @param {object} keilimOptions Planner options. @returns {object} Deterministic atlas plan. */
	atlasPlan(sederItems = [], keilimOptions = {}) {
		return BinahTextureAtlasPlanner.plan(sederItems, keilimOptions);
	}

	/** @param {object} keliInput Bake-plan request. @returns {object} Deterministic animated texture plan. */
	bakePlan(keliInput = {}) {
		const zmanStart = Math.max(0, Number(keliInput.start) || 0);
		const zmanEnd = Math.max(zmanStart, Number(keliInput.end) || zmanStart);
		const gevurahFps = Math.min(120, Math.max(1, Number(keliInput.fps) || 24));
		const zmanFrameMs = 1000 / gevurahFps;
		const gevurahFrameCount = Math.floor((zmanEnd - zmanStart) / zmanFrameMs) + 1;
		return {
			version: 1,
			objectId: String(keliInput.objectId ?? ''),
			range: { start: zmanStart, end: zmanEnd },
			fps: gevurahFps,
			frameDurationMs: zmanFrameMs,
			frameCount: gevurahFrameCount,
			format: String(keliInput.options?.format ?? 'sprite-sheet'),
			atlas: structuredClone(keliInput.options?.atlas ?? { policy: 'auto' }),
			deterministic: true
		};
	}

	/** @returns {object} Current canonical Studio document. */
	document() {
		const keliDocument = this.malchusStore.get().studioDocument;
		if (keliDocument) {
			return keliDocument;
		}
		throw this.error('missing_studio_document', 'No Studio document is installed.');
	}

	/** @param {string} sodObjectId Entity ID. @param {object} keliDocument Document. @returns {object} Studio entity. */
	entity(sodObjectId, keliDocument) {
		const keliEntity = keliDocument.entities?.find((keli) => keli.id === sodObjectId);
		if (keliEntity?.properties?.renderSpec) {
			return keliEntity;
		}
		throw this.error('object_not_texturable', `Texturable Studio object not found: ${sodObjectId}`);
	}

	/** @param {boolean} yesodRequired Require runtime. @returns {object|null} Shared universal render runtime. */
	renderRuntime(yesodRequired) {
		const keterRenderRuntime = this.keterRuntime.renderRuntime
			?? this.keterRuntime.app?.nle?.renderRuntime
			?? null;
		if (keterRenderRuntime || !yesodRequired) {
			return keterRenderRuntime;
		}
		throw this.error('environment_unavailable', 'The universal render runtime is unavailable.');
	}

	/** @param {string} shemCode Error code. @param {string} orMessage Message. @returns {Error} Stable error. */
	error(shemCode, orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = shemCode;
		return gevurahError;
	}
}
