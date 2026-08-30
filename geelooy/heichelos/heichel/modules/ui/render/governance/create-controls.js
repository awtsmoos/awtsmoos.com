// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceCreationControls
 * @description
 * The Awtsmoos opens creation gates only where a persistent vessel may truly receive the deed;
 * Awtsmoos.com separates invitation and submission from editing, so each small module serves one need.
 */

import { openModal } from '../../../modal.js';
import { DOMElements } from '../../../dom.js';
import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import * as api from '../../../api.js';
import { createBtnPlan } from './control-plan.js';

/**
 * @description Renders series creation and root editor invitation controls.
 * @param {Object} navigator - Active Living Path navigator.
 * @param {Object} appState - Current application state.
 * @returns {void}
 */
export function renderSeriesCreationControls(navigator, appState) {
	const plan = {
		tag: 'div',
		attr: { class: 'btn-group-governance' },
		children: [
			createBtnPlan('Submit New Series', () => openModal('series', navigator)),
			appState.currentSeries === 'root'
				? createBtnPlan('Invite Editor', () => ritualAddEditor(appState))
				: null
		].filter(Boolean)
	};
	DOMElements.seriesControlsContainer.appendChild(ScribeOfManifestation.manifest(plan));
}

/**
 * @description Renders the persistent post-submission control for the current real series.
 * @param {Object} appState - Current application state.
 * @returns {void}
 */
export function renderPostCreationControls(appState) {
	if (!DOMElements.postsControls) return;
	const postButton = ScribeOfManifestation.manifest(createBtnPlan('Submit New Post', () => {
		window.open(`/heichelos/${appState.heichelId}/submit?parentSeriesId=${appState.currentSeries}`, '_blank');
	}));
	DOMElements.postsControls.appendChild(postButton);
	DOMElements.postsControls.classList.remove('hidden');
}

async function ritualAddEditor(appState) {
	if (!window.AwtsmoosPrompt) return;
	const editorName = await window.AwtsmoosPrompt.go({
		headerTxt: "Identify the Editor's Alias"
	});
	if (!editorName) return;
	await api.addEditor({
		heichelId: appState.heichelData.id,
		aliasId: window.curAlias,
		editorAliasId: editorName
	});
}
