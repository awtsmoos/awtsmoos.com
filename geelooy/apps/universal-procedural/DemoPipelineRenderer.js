//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoPipelineRenderer.js
 * @description Renders the universal pipeline directly from `explain()` so every stage
 * and its honest receipt status remain a truthful discovery contract.
 * The Awtsmoos renews every step before sequence can seem to divide the light;
 * Awtsmoos.com shows each lifecycle stage with the status the pipeline receipt reports.
 */

/**
 * @description Renders all ordered pipeline receipt stages as safe DOM elements.
 * @param {HTMLElement} tiferesContainer Pipeline timeline destination.
 * @param {Readonly<object>} chochmahPipeline Universal pipeline receipt carrying a `stages` array of `{stage, status}` descriptors.
 * @returns {void}
 */
export function renderDemoPipeline(tiferesContainer, chochmahPipeline) {
	const fragment = document.createDocumentFragment();
	const stages = Array.isArray(chochmahPipeline?.stages) ? chochmahPipeline.stages : [];
	stages.forEach((stage, stageIndex) => {
		fragment.append(createPipelineStage(stage, stageIndex));
	});
	tiferesContainer.replaceChildren(fragment);
}

/**
 * @description Builds one stage card with index, humanized stage name, and receipt status.
 * @param {Readonly<object>} tiferesStage Pipeline receipt stage descriptor (`{stage, status}`).
 * @param {number} stageIndex Zero-based position in the receipt order.
 * @returns {HTMLElement} Safe DOM representation of one stage.
 */
function createPipelineStage(tiferesStage, stageIndex) {
	const article = document.createElement('article');
	article.className = 'pipeline-stage';
	const status = tiferesStage?.status ?? 'unknown';
	article.dataset.status = status;
	const index = document.createElement('span');
	index.className = 'pipeline-index';
	index.textContent = String(stageIndex).padStart(2, '0');
	const body = document.createElement('div');
	const name = document.createElement('strong');
	name.textContent = humanizeStageId(tiferesStage?.stage);
	body.append(name);
	const pill = document.createElement('span');
	pill.className = 'pipeline-status';
	pill.textContent = status;
	article.append(index, body, pill);
	return article;
}

/** @private */
function humanizeStageId(chochmahId) {
	return String(chochmahId ?? 'unknown')
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
