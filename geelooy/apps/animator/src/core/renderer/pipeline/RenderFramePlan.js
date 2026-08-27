// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RenderFramePlan
 * @description
 * The Awtsmoos renews camera, stage, quality, and authored intention before one frame may shine;
 * Awtsmoos.com gathers core state and professional Studio state into one explicit rendering line.
 */
import { AutomaticShotDirector } from '../../../director/camera/AutomaticShotDirector.js';
import { CinematicMobileShotDirector } from '../../../director/camera/CinematicMobileShotDirector.js';
import { FrameQualityOracle } from '../../../director/quality/FrameQualityOracle.js';
import { CinematicStagingDirector } from '../../../director/staging/CinematicStagingDirector.js';
import { CinematicSceneTreatment } from './phases/CinematicSceneTreatment.js';

/** Resolves immutable frame inputs for preview and export without hidden global state. */
export class RenderFramePlan {
	/** @returns {Object} The complete frame intention consumed by the render graph. */
	static resolve(app, realTime) {
		const { ctx, state, director } = app;
		const directorTime = director?.getElapsed
			? director.getElapsed()
			: realTime / 1000;
		const rawCamera = this.camera(state);
		const cinematicPlan = AutomaticShotDirector.plan({
			ctx,
			state,
			time: directorTime,
			camera: rawCamera
		});
		const camera = CinematicMobileShotDirector.resolve(
			ctx,
			state,
			rawCamera,
			cinematicPlan
		);
		return {
			ctx,
			state,
			studioState: app.nle?.store?.get?.() || null,
			realTime,
			directorTime,
			camera,
			cinematicPlan,
			quality: FrameQualityOracle.score(cinematicPlan, camera),
			staging: CinematicStagingDirector.resolve(cinematicPlan),
			sceneData: CinematicSceneTreatment.apply(
				state.get('scene') || {},
				camera
			),
			sequence: state.get('activeSequence')
		};
	}

	/** @returns {Object} A normalized camera vessel with stable transform defaults. */
	static camera(state) {
		const raw = state?.get ? state.get('camera') : null;
		if (!raw) {
			return {
				x: 0,
				y: 0,
				zoom: 1,
				shot: 'group',
				cameraId: 'group'
			};
		}
		return {
			...raw,
			x: Number(raw.x) || 0,
			y: Number(raw.y) || 0,
			zoom: Number(raw.zoom) || 1,
			shot: raw.shot || raw.framing || raw.cameraId || 'group',
			cameraId: raw.cameraId || raw.id || raw.shot || 'group'
		};
	}
}
