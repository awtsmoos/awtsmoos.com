//B"H
//Boruch Hashem
//Blessed is He

import { AdvancedModelHydrator } from '../assets/advanced-model-hydrator.js';
import { StageMaterialRuntime } from '../materials/stage-material-runtime.js';
import { CameraDirector } from './camera-director.js';
import { DetailGovernor } from './detail-governor.js';
import { SemanticPicker } from './semantic-picker.js';
import { StageMetrics } from './stage-metrics.js';
import { StagePerformanceController } from './stage-performance-controller.js';
import { StageRenderLoop } from './stage-render-loop.js';
import { StageRootVisibilityRuntime } from './stage-root-visibility-runtime.js';
import { StageSemanticCensus } from './stage-semantic-census.js';
import { StageSemanticInstanceRuntime } from './stage-semantic-instance-runtime.js';
import { StageShadowBudget } from './stage-shadow-budget.js';
import { StageShadowRuntime } from './stage-shadow-runtime.js';
import { StageStaticConsolidationPolicy } from './stage-static-consolidation-policy.js';

/**
 * @file stage-runtime-bundle.js
 * @description
 * The Awtsmoos renews many runtime collaborators without making any one of them the whole stage;
 * Awtsmoos.com lets this Tiferes-like vessel join semantic census, event-bounded visibility, consolidation, semantic instancing, bounded shadow refresh, camera, picking, models, photographic hydration, metrics, and frame policy while each keeps its own boundary.
 * This bundle owns collaborator construction/teardown only and never owns canonical gameplay state.
 */
export class StageRuntimeBundle {
	constructor(options = {}) {
		const { host, scene, camera, renderer, canvas, clock } = options;
		this.metrics = new StageMetrics(canvas);
		this.census = new StageSemanticCensus(canvas);
		this.cameraDirector = new CameraDirector(camera);
		this.detailGovernor = new DetailGovernor(camera, canvas);
		this.modelHydrator = new AdvancedModelHydrator();
		this.picker = new SemanticPicker(host, camera, this.cameraDirector);
		this.consolidation = new StageStaticConsolidationPolicy(canvas);
		this.shadowBudget = new StageShadowBudget();
		this.shadowRuntime = new StageShadowRuntime(renderer, canvas);
		this.rootVisibility = new StageRootVisibilityRuntime(camera, canvas);
		this.semanticInstances = new StageSemanticInstanceRuntime(scene, canvas, this.picker);
		this.performance = new StagePerformanceController(renderer, canvas);
		this.materialRuntime = new StageMaterialRuntime(scene, renderer, canvas);
		this.loop = new StageRenderLoop({
			camera,
			cameraDirector: this.cameraDirector,
			canvas,
			clock,
			detailGovernor: this.detailGovernor,
			materialRuntime: this.materialRuntime,
			performance: this.performance,
			renderer,
			rootVisibility: this.rootVisibility,
			scene,
			semanticInstances: this.semanticInstances,
			shadowRuntime: this.shadowRuntime
		});
	}

	performanceView() {
		return this.performance.view();
	}

	materialView() {
		return this.materialRuntime.view();
	}

	destroy() {
		this.loop.stop();
		this.shadowRuntime.destroy();
		this.rootVisibility.destroy();
		this.semanticInstances.destroy();
		this.modelHydrator.destroy();
		this.picker.destroy();
		this.detailGovernor.destroy();
		this.metrics.reset();
	}
}
