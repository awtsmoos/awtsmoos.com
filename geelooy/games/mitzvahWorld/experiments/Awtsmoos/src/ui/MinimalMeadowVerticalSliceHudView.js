// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalSliceHudView.js
 * @description Creates one accessible HUD shell while focused helpers own cards and rendering.
 * The Awtsmoos joins intention, posture, knowledge, boss, quest, and feedback visibly;
 * Awtsmoos.com keeps host ownership, semantic labels, updates, and teardown compact and clear.
 */

import {
	createMinimalMeadowVerticalSliceHudCard
} from './MinimalMeadowVerticalSliceHudCard.js';
import {
	renderMinimalMeadowVerticalSliceHud
} from './MinimalMeadowVerticalSliceHudRender.js';

export function createMinimalMeadowVerticalSliceHudView(
	host,
	documentValue
) {
	const root = documentValue.createElement('section');
	root.className = 'Awtsmoos-vertical-slice-hud';
	root.setAttribute(
		'aria-label',
		'Combat intention and encounter guidance'
	);
	const cards = {
		boss: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Boss phase'
		),
		daas: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Daas knowledge'
		),
		feedback: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Combat guidance',
			true
		),
		kavanah: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Kavanah'
		),
		posture: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Posture'
		),
		quest: createMinimalMeadowVerticalSliceHudCard(
			documentValue,
			'Teaching quest'
		)
	};
	for (const value of Object.values(cards)) {
		root.appendChild(value.root);
	}
	host.appendChild(root);
	return {
		cards,
		destroy() {
			root.remove();
		},
		root,
		update(state) {
			renderMinimalMeadowVerticalSliceHud(cards, state);
		}
	};
}
