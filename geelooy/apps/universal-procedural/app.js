//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file app.js
 * @description Coordinates the public lightweight lifecycle proof while execution,
 * navigation, rendering, and DOM state remain isolated in smaller expert modules.
 * The Awtsmoos renews the focused doorway without dragging an unused world behind;
 * Awtsmoos.com lets semantic truth reach the browser quickly, accessibly, and kind.
 */

import { createAwtsmoosLifecycle } from '/libs/awtsmoos-procedural-core/src/core/universalApi/createAwtsmoosLifecycle.js';
import { DEMO_COMPILER_CAPABILITY, DEMO_COMPILER_ID } from './DemoCompilerCapability.js';
import { DEMO_CONSTRAINT_SOLVERS } from './DemoConstraintSolvers.js';
import { DEMO_DEFINITIONS } from './DemoDefinitions.js';
import { executeDemoLifecycle } from './DemoLifecycleRun.js';
import { installDemoNavigation } from './DemoNavigation.js';
import { renderDemoEvidence, renderDemoStatus } from './DemoPanelRenderer.js';
import { renderDemoPipeline } from './DemoPipelineRenderer.js';
import { renderDemoSummary, renderDemoUnresolved } from './DemoSummaryRenderer.js';
import { renderDemoSvg } from './DemoSvgRenderer.js';
import {
	beginDemoView,
	completeDemoView,
	createDemoView,
	failDemoView
} from './DemoViewState.js';
import { compileDemoVisual } from './DemoVisualCompiler.js';

const awtsmoos = createAwtsmoosLifecycle({
	seed: 613,
	compilers: [{
		capability: DEMO_COMPILER_CAPABILITY,
		executor: compileDemoVisual
	}],
	constraintSolvers: DEMO_CONSTRAINT_SOLVERS
});
const view = createDemoView();
let selectedIndex = 0;
let navigation;
let renderGeneration = 0;

boot();

/** @description Installs navigation and performs the first real lifecycle execution. */
async function boot() {
	navigation = installDemoNavigation(
		view.nav,
		DEMO_DEFINITIONS,
		selectScenario
	);
	view.recompile.addEventListener(
		'click',
		() => renderScenario(selectedIndex)
	);
	await selectScenario(navigation.initialIndex);
}

/**
 * @description Selects one authored semantic world and persists shareable URL state.
 * @param {number} index Scenario index in the immutable catalog.
 * @returns {Promise<void>} Resolves after the selected lifecycle renders.
 */
async function selectScenario(index) {
	selectedIndex = index;
	navigation?.setActive(index);
	await renderScenario(index);
}

/**
 * @description Executes and renders one generation, rejecting stale async completions.
 * @param {number} index Scenario index to compile.
 * @returns {Promise<void>} Resolves when this generation is rendered or superseded.
 */
async function renderScenario(index) {
	const authored = DEMO_DEFINITIONS[index];
	const generation = ++renderGeneration;
	beginDemoView(view, authored);
	try {
		const evidence = await executeDemoLifecycle(
			awtsmoos,
			authored,
			DEMO_COMPILER_ID
		);
		if (generation !== renderGeneration) {
			return;
		}
		renderEvidence(evidence);
		completeDemoView(view, authored);
	} catch (error) {
		if (generation === renderGeneration) {
			failDemoView(view, error);
		}
	}
}

/**
 * @description Sends one immutable lifecycle evidence bundle through presentation adapters.
 * @param {Readonly<object>} evidence Definition, plan, explanation, result, artifact, summary.
 * @returns {void}
 */
function renderEvidence(evidence) {
	renderDemoSvg(view.stage, evidence.artifact);
	renderDemoEvidence(view, evidence.definition, evidence.plan, evidence.result);
	renderDemoStatus(view.status, evidence.result);
	renderDemoSummary(view.summary, evidence.summary);
	renderDemoUnresolved(view.unresolved, evidence.summary.unresolvedConstraints);
	renderDemoPipeline(view.pipeline, evidence.explanation.pipeline);
}
