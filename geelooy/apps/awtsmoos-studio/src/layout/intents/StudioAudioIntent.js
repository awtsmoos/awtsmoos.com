//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAudioIntent.js
 * @description Gives mobile makers a real audio-import doorway with explicit semantic type before deeper professional audio tooling.
 * The Awtsmoos gives silence, speech, song, and sound their measured place while Awtsmoos.com lets one local file become durable cinematic memory;
 * narration, music, SFX, and dialogue choose meaning first, then imported bytes enter the same canonical timeline used by preview, save, undo, and export harmony.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';

const AUDIO_KINDS = Object.freeze([
	kind('Narration', '◉', 'narration'),
	kind('Music', '♫', 'music'),
	kind('SFX', '♪', 'sfx'),
	kind('Dialogue', '“”', 'dialogue')
]);

export function createStudioAudioIntent() {
	return UI.section(
		{
			class: 'studio-intent-body studio-audio-intent',
			hidden: context => context.store.get('primaryIntent') !== 'audio'
		},
		UI.div({ class: 'studio-intent-subheading', text: 'Import audio' }),
		UI.div(
			{ class: 'studio-intent-action-grid studio-audio-kind-grid' },
			...AUDIO_KINDS.map(createKindButton)
		),
		UI.label(
			{ class: 'studio-audio-import-control' },
			UI.strong({ text: context => `Choose ${audioKindLabel(context.store.get('audioImportKind'))} file` }),
			UI.span({ text: 'Audio stays available after reload and joins preview + MP4 export.' }),
			UI.input({
				class: 'studio-audio-file-input',
				type: 'file',
				accept: 'audio/*',
				$on: { change: 'importStudioAudio' }
			})
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

function createKindButton(item) {
	return UI.button(
		{
			class: 'studio-intent-action-button',
			type: 'button',
			'data-audio-kind': item.kind,
			'aria-pressed': context => String(context.store.get('audioImportKind') === item.kind),
			$on: { click: 'selectStudioAudioImportKind' }
		},
		UI.span({ class: 'studio-intent-action-glyph', text: item.glyph, 'aria-hidden': 'true' }),
		UI.span({ text: item.label })
	);
}

function audioKindLabel(kindValue) {
	return AUDIO_KINDS.find(item => item.kind === kindValue)?.label || 'Music';
}

function kind(label, glyph, kindValue) {
	return Object.freeze({ label, glyph, kind: kindValue });
}
