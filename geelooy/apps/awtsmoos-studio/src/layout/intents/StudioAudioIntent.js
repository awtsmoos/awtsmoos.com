//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAudioIntent.js
 * @description Gives phone makers immediate canonical audio objects through visible AwtsmoosUI children before inviting the heavier professional audio island.
 * The Awtsmoos gives silence, speech, song, and sound their measured place in time, while Awtsmoos.com keeps the first doorway light;
 * narration, music, and effects use the same movie command road, and deeper audio machinery crosses only after explicit delight.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

const QUICK_AUDIO_ITEMS = Object.freeze([
	item('Narration', '◉', 'narration'),
	item('Music', '♫', 'music'),
	item('Sound', '♪', 'sfx'),
	item('Dialogue', '“”', 'dialogue')
]);

/** Creates the beginner Audio intent from real canonical audio layer kinds. */
export function createStudioAudioIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-audio-intent',
			hidden: (context) => context.store.get('primaryIntent') !== 'audio'
		},
		UI.div(
			{ class: 'studio-intent-action-grid' },
			...QUICK_AUDIO_ITEMS.map(createAudioButton)
		),
		UI.button({
			class: 'studio-intent-depth-button',
			type: 'button',
			'data-pro-tool': 'audio',
			$on: { click: 'openProTool' },
			text: 'Open professional Audio tools'
		})
	);
}

/** Creates one canonical audio layer action with visible glyph and label children. */
function createAudioButton(ohrItem) {
	return UI.button(
		{
			class: 'studio-intent-action-button',
			type: 'button',
			'data-command-type': 'create',
			'data-command-value': ohrItem.kind,
			$on: { click: 'executeStudioCommand' }
		},
		UI.span({ class: 'studio-intent-action-glyph', text: ohrItem.glyph, 'aria-hidden': 'true' }),
		UI.span({ text: ohrItem.label })
	);
}

/** Creates one immutable audio quick-add descriptor. */
function item(label, glyph, kind) {
	return Object.freeze({ label, glyph, kind });
}
