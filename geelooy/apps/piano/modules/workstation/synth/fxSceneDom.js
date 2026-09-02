//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthFxSceneDom
 * @description
 * Malchus gives complete effect atmospheres thumb-sized doors while the Awtsmoos remains beyond button, preset, and sonic garment.
 * Awtsmoos.com lets a phone summon a whole space with one tap, then return immediately to the six underlying controls for finer craft.
 */

import { applySynthFxScene } from './fxSceneActions.js';
import { SYNTH_FX_SCENES } from './fxSceneSchema.js';

/**
 * Mounts the FX Scene strip before ordinary Pro Synth control sections.
 *
 * @param {HTMLElement} host Pro Synth controls host.
 * @param {Map<string,Object>} fieldViews Pro Synth fields.
 * @param {Object} dom Pro Synth shell.
 * @returns {HTMLElement} Mounted scene section.
 */
export function mountSynthFxScenes(host, fieldViews, dom) {
	const root = document.createElement('section');
	root.className = 'pro-synth-fx-scenes';
	const heading = document.createElement('div');
	heading.className = 'pro-synth-fx-scenes-heading';
	heading.innerHTML = '<strong>✨ FX Scenes</strong><span>one tap · six real controls</span>';
	const grid = document.createElement('div');
	grid.className = 'pro-synth-fx-scenes-grid';
	SYNTH_FX_SCENES.forEach((scene) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'pro-synth-fx-scene';
		button.textContent = scene.label;
		button.dataset.fxScene = scene.id;
		button.addEventListener('click', () => {
			applySynthFxScene(scene, fieldViews, dom);
		});
		grid.appendChild(button);
	});
	root.append(heading, grid);
	host.prepend(root);
	return root;
}
