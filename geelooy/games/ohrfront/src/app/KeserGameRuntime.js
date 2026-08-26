// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserGameRuntime.js
 * @description Governs lifecycle while shared-core performance and visibility laws observe rendered frames without ever owning deterministic gameplay cadence.
 * Keser crowns timing, simulation, concealment, manifestation, and measured restraint while the Awtsmoos remains beyond every finite frame and throne;
 * Awtsmoos.com lets visual quality and distant decoration bend under evidence as Netzach preserves exact gameplay slices and reveals any discarded catch-up debt alone.
 */
import { getDifficultyProfile } from "../ai/BotDifficultyProfiles.js";
import { CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE } from "../performance/ChochmahOhrfrontPerformanceProfile.js";
import { KeserPerformanceAuthority } from "../performance/KeserPerformanceAuthority.js";
import { createRuntimeAssembly } from "./RuntimeAssembly.js";
import { createRuntimeDebugSurface } from "./RuntimeDebugSurface.js";
import { bindRuntimeEvents } from "./RuntimeEvents.js";
import { manifestMalchusBattleCompletion } from "./runtime/MalchusBattleCompletion.js";
import { NetzachFixedStepClock } from "./runtime/NetzachFixedStepClock.js";
import { beginTiferesBattle } from "./runtime/TiferesBattleGenesis.js";
import { advanceTiferesSimulation } from "./runtime/TiferesSimulationStep.js";

export class KeserGameRuntime {
	/**
	 * Assembles dependencies and returns one not-yet-booted governing runtime.
	 * @returns {Promise<KeserGameRuntime>} Fully assembled runtime before animation-frame scheduling begins.
	 */
	static async create() {
		return new KeserGameRuntime(await createRuntimeAssembly());
	}

	/**
	 * Creates Keser around one assembled vessel and composes fixed-step plus rendered-frame authorities independently.
	 * @param {object} chochmahAssembly - Renderer, scene, gameplay, UI, material, visibility, audio, and render-scale authorities.
	 * @sideEffects Copies assembly properties, creates timing/performance state, binds runtime events, and binds `frame` context.
	 */
	constructor(chochmahAssembly) {
		Object.assign(this, chochmahAssembly);
		this.difficulty = getDifficultyProfile("vanguard");
		this.botDirector = null;
		this.running = false;
		this.completed = false;
		this.elapsed = 0;
		this.netzachClock = new NetzachFixedStepClock();
		this.hodFrameTiming = createInitialTimingReceipt();
		this.performanceAuthority = new KeserPerformanceAuthority(
			this.renderScaleAuthority,
			CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE
		);
		this.frame = this.frame.bind(this);
		bindRuntimeEvents(this);
	}

	/**
	 * Begins battle genesis while preserving the historical Promise<void> public contract.
	 * @param {string} chochmahDifficultyId - Difficulty id selected at launch.
	 * @returns {Promise<void>} Resolves after Tiferes battle genesis completes.
	 */
	async startBattle(chochmahDifficultyId) {
		await beginTiferesBattle(this, chochmahDifficultyId);
	}

	/** Publishes debug access and schedules the first browser animation frame. */
	boot() {
		window.__OHRFRONT_DEBUG__ = createRuntimeDebugSurface(this);
		requestAnimationFrame(this.frame);
	}

	/**
	 * Measures rendered-frame subsystems, advances bounded fixed simulation, renders, evaluates quality on Hod cadence, then schedules continuation.
	 * @param {number} netzachNowMilliseconds - requestAnimationFrame timestamp.
	 * @returns {void}
	 * @sideEffects Advances gameplay/render state, may resize only framebuffer, records timing debt, and schedules the next frame.
	 * @invariant Performance/visibility policy never changes fixed-step cadence, collision truth, or the delta supplied to `fixedUpdate`.
	 */
	frame(netzachNowMilliseconds) {
		this.performanceAuthority.beginFrame(netzachNowMilliseconds);
		this.hodFrameTiming = Object.freeze(this.performanceAuthority.measure("simulation", () => {
			return this.netzachClock.consume(
				netzachNowMilliseconds / 1000,
				netzachDelta => this.fixedUpdate(netzachDelta)
			);
		}));
		this.performanceAuthority.measure("visibility", () => {
			this.visibilityAuthority?.update?.(this.player.position, this.player.yaw);
		});
		this.performanceAuthority.measure("emitter", () => {
			this.emitter.update(this.elapsed, this.player.movementIntensity, this.player.motion);
		});
		this.performanceAuthority.measure("render", () => {
			this.renderer.setInteractor(this.player.position, this.elapsed);
			this.renderer.render(this.scene, this.camera);
		});
		this.performanceAuthority.endFrame(netzachNowMilliseconds);
		requestAnimationFrame(this.frame);
	}

	/** Delegates one deterministic simulation slice to Tiferes stage coordination. */
	fixedUpdate(netzachDelta) {
		advanceTiferesSimulation(this, netzachDelta);
	}

	/** Manifests encounter completion idempotently while preserving the historical void return. */
	completeBattle() {
		manifestMalchusBattleCompletion(this);
	}
}

/** Creates immutable zero-debt timing evidence before the first rendered frame is consumed. */
function createInitialTimingReceipt() {
	return Object.freeze({
		frameDelta: 0,
		steps: 0,
		accumulator: 0,
		droppedSeconds: 0,
		capped: false
	});
}
