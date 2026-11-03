//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioGeneratePanel.js
 * @description The instant generator's visible doorway: one mode switch, one Generate button, one honest line about what each mode really does.
 * The Awtsmoos creates at the speed of intention while Awtsmoos.com refuses to let a label promise more than the renderer performs.
 */

import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import {
	MOVIE_RENDER_MODE_DESCRIPTIONS,
	MovieRenderModes
} from '../../../shared/movie/render/MovieRenderModes.js';
import { describeInstantMovieTemplates } from '../../../shared/movie/examples/InstantMovieTemplates.js';

const MODE_LABELS = Object.freeze({
	auto: 'Auto',
	'2d': '2D Photo',
	'3d': '3D Stage',
	hybrid: 'Hybrid'
});

/** Build the Generate Movie panel that sits beneath the AI Director in the inspector. */
export function createStudioGeneratePanel() {
	return UI.div(
		{ class: 'aw-ui-stack', 'data-studio-generate-panel': 'true' },
		UI.h3({ text: 'Instant Movie — from JSON' }),
		UI.div(
			{ class: 'aw-ui-bar', role: 'group', 'aria-label': 'Render mode' },
			...MovieRenderModes.map(mode => UI.button({
				class: 'aw-ui-button',
				type: 'button',
				'data-render-mode': mode,
				'aria-pressed': context => String(selectedMode(context) === mode),
				$on: { click: 'selectGenerateRenderMode' },
				text: MODE_LABELS[mode]
			}))
		),
		UI.div({
			class: 'studio-generate-description',
			text: context => MOVIE_RENDER_MODE_DESCRIPTIONS[selectedMode(context)]
		}),
		UI.div(
			{ class: 'aw-ui-bar' },
			UI.button({
				class: 'aw-ui-button aw-ui-button--accent',
				type: 'button',
				text: '▶ Generate Movie',
				'data-studio-generate': 'true',
				$on: { click: 'generateInstantMovie' }
			}),
			UI.button({
				class: 'aw-ui-button',
				type: 'button',
				text: 'Export MP4',
				'data-studio-generate-export': 'true',
				$on: { click: 'generateInstantExport' }
			})
		),
		UI.label({ text: 'Instant templates' }),
		UI.div(
			{ class: 'aw-ui-bar' },
			...describeInstantMovieTemplates().map(template => UI.button({
				class: 'aw-ui-button',
				type: 'button',
				'data-instant-template': template.id,
				title: template.description,
				$on: { click: 'loadInstantTemplate' },
				text: `${template.title} · ${MODE_LABELS[template.mode]}`
			}))
		),
		UI.div({
			class: 'studio-generate-note',
			text: 'Photographs are real photographs. The 3D stage is real-time WebGL — procedural set pieces plus the Chossid model — not ray-traced.'
		})
	);
}

function selectedMode(context) {
	return context.store.get('movie')?.render?.mode || 'auto';
}
