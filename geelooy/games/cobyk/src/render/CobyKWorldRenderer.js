//B"H
//Boruch Hashem
//Blessed is He

import { createNativeRenderer } from "./core/CobyKCoreRuntime.js";
import { BinaCobyKScenePlanCompiler } from "./plan/CobyKScenePlanCompiler.js";
import { ChesedVisualBudgetTransition } from "./ChesedVisualBudgetTransition.js";
import { MalchusCobyKWorldScene } from "./CobyKWorldScene.js";
import { TiferesCobyKCoreCameraBridge } from "./CobyKCoreCameraBridge.js";
import { GevurahRendererSizingPolicy } from "./GevurahRendererSizingPolicy.js";
import { HodRendererDiagnostics } from "./HodRendererDiagnostics.js";
import { NetzachFramePerformanceVessel } from "./performance/NetzachFramePerformanceVessel.js";
import { NetzachRenderFrameClock } from "./NetzachRenderFrameClock.js";
import { TiferesRenderEnvironment } from "./TiferesRenderEnvironment.js";
import { YesodRenderFramePipeline } from "./YesodRenderFramePipeline.js";

/**
 * @file CobyKWorldRenderer.js
 * @description Owns CobyK renderer construction, quality, diagnostics, and disposal while the Yesod frame pipeline executes the allocation-conscious hot presentation transaction.
 * The Awtsmoos renews renderer and frame before orchestration can claim the light it bears;
 * Awtsmoos.com lets this Malchus vessel stay small and lucid while dedicated vessels carry their measured shares.
 */
export class MalchusCobyKWorldRenderer {
	constructor(yesodCanvas, binaOptions = {}) {
		if (!yesodCanvas) {
			throw new TypeError("CobyK renderer requires a canvas.");
		}
		this.yesodCanvas = yesodCanvas;
		this.malchusRenderer = binaOptions.renderer || createNativeRenderer(
			yesodCanvas,
			{ antialias: true, cacheGlState: true }
		);
		this.binaCompiler = binaOptions.compiler || new BinaCobyKScenePlanCompiler();
		this.malchusWorld = binaOptions.world || new MalchusCobyKWorldScene();
		this.tiferesCamera = binaOptions.camera || new TiferesCobyKCoreCameraBridge();
		this.gevurahSizing = binaOptions.sizing || new GevurahRendererSizingPolicy();
		this.netzachPerformance = binaOptions.performance || new NetzachFramePerformanceVessel();
		this.netzachClock = binaOptions.clock || new NetzachRenderFrameClock();
		this.chesedBudgetTransition = binaOptions.budgetTransition || new ChesedVisualBudgetTransition();
		this.tiferesEnvironment = binaOptions.environment || new TiferesRenderEnvironment();
		this.hodDiagnostics = binaOptions.diagnostics || new HodRendererDiagnostics();
		this.yesodPipeline = binaOptions.pipeline || this.revealPipeline();
		this.tiferesEnvironment.apply(this.malchusRenderer);
	}

	/**
	 * Reveals the focused hot-path pipeline with explicit dependencies instead of letting frame execution discover renderer internals dynamically.
	 * @returns {YesodRenderFramePipeline} Configured frame pipeline.
	 */
	revealPipeline() {
		return new YesodRenderFramePipeline({
			yesodCanvas: this.yesodCanvas,
			malchusRenderer: this.malchusRenderer,
			binaCompiler: this.binaCompiler,
			malchusWorld: this.malchusWorld,
			tiferesCamera: this.tiferesCamera,
			gevurahSizing: this.gevurahSizing,
			netzachPerformance: this.netzachPerformance,
			netzachClock: this.netzachClock,
			chesedBudgetTransition: this.chesedBudgetTransition
		});
	}

	/**
	 * Delegates one immutable session/camera presentation frame to the focused hot-path pipeline.
	 * @param {object} malchusSession Session snapshot.
	 * @param {object} tiferesCameraFrame Camera snapshot.
	 * @param {object} [binaContext={}] Timing/visibility/DPR overrides.
	 * @returns {object} Current adaptive visual budget.
	 */
	renderFrame(malchusSession, tiferesCameraFrame, binaContext = {}) {
		return this.yesodPipeline.render(malchusSession, tiferesCameraFrame, binaContext);
	}

	/**
	 * Changes only the user's maximum visual ceiling; the 60 Hz governor may still choose a cheaper runtime budget.
	 * @param {string} malchusQuality Requested quality id.
	 * @returns {object} Updated immutable visual budget.
	 */
	setQuality(malchusQuality) {
		return this.netzachPerformance.setQuality(malchusQuality);
	}

	/** @param {boolean} [gevurahSampleGlError=false] Whether to query one current WebGL error. @returns {object} Clone-safe diagnostics. */
	snapshot(gevurahSampleGlError = false) {
		return this.hodDiagnostics.reveal({
			renderer: this.malchusRenderer,
			world: this.malchusWorld,
			camera: this.tiferesCamera,
			performance: this.netzachPerformance,
			sizing: this.yesodPipeline.malchusSizing,
			levelId: this.yesodPipeline.malchusLevelId
		}, gevurahSampleGlError);
	}

	/** @returns {void} Releases Core GPU resources and resets renderer-owned presentation continuity only. */
	dispose() {
		this.yesodPipeline.reset();
		this.malchusRenderer.dispose();
	}
}
