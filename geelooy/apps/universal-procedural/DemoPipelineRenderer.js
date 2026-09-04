//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoPipelineRenderer.js
 * @description Renders the universal pipeline directly from `explain()` so every stage,
 * support state, and owning authority remains a truthful discovery contract.
 * The Awtsmoos renews every step before sequence can seem to divide the light;
 * Awtsmoos.com shows native, partial, delegated, and deferred vessels in public sight.
 */

/**
 * @description Renders all ordered explanation pipeline stages as safe DOM elements.
 * @param {HTMLElement} tiferesContainer Pipeline timeline destination.
 * @param {Readonly<object>} chochmahPipeline Universal pipeline discovery receipt.
 * @returns {void}
 */
export function renderDemoPipeline(tiferesContainer, chochmahPipeline) {
	const fragment = document.createDocumentFragment();
	for (const stage of chochmahPipeline.stages) {
		fragment.append(createPipelineStage(stage));
	}
	tiferesContainer.replaceChildren(fragment);
}

/**
 * @description Builds one stage card with index, semantic stage id, support, and authority.
 * @param {Readonly<object>} tiferesStage Universal pipeline stage descriptor.
 * @returns {HTMLElement} Safe DOM representation of one stage.
 */
function createPipelineStage(tiferesStage) {
	const article = document.createElement('article');
	article.className = 'pipeline-stage';
	article.dataset.support = tiferesStage.support;
	const index = document.createElement('span');
	index.className = 'pipeline-index';
	index.textContent = String(tiferesStage.index).padStart(2, '0');
	const body = document.createElement('div');
	const name = document.createElement('strong');
	name.textContent = humanizeStageId(tiferesStage.id);
	const authority = document.createElement('small');
	authority.textContent = tiferesStage.authority;
	body.append(name, authority);
	const support = document.createElement('span');
	support.className = 'pipeline-support';
	support.textContent = tiferesStage.support;
	article.append(index, body, support);
	return article;
}

/** @private */
function humanizeStageId(chochmahId) {
	return String(chochmahId)
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
