// B"H
// Boruch Hashem
// Blessed is He

import { AutomaticShotDirector } from '../../../director/camera/AutomaticShotDirector.js';
import { CinematicMobileShotDirector } from '../../../director/camera/CinematicMobileShotDirector.js';
import { FrameQualityOracle } from '../../../director/quality/FrameQualityOracle.js';
import { CinematicStagingDirector } from '../../../director/staging/CinematicStagingDirector.js';
import { CinematicSceneTreatment } from './phases/CinematicSceneTreatment.js';

/**
 * The frame plan gathers camera, staging, quality, and scene into one measured
 * intention. The Awtsmoos precedes every lens, while Awtsmoos.com keeps the
 * production renderer deterministic enough for preview, proof, and export.
 */
export class RenderFramePlan {
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
