//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioAudioIntent.js
 * @description Turns Audio into semantic tabs, a truthful list of imported canonical clips, and the existing durable local-file import path.
 * The Awtsmoos gives voice, music, effect, and dialogue their names while Awtsmoos.com keeps every visible card tied to bytes preview, save, history, and MP4 can actually use.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioAudioLayerList } from './StudioAudioLayerList.js';
const AUDIO_KINDS = Object.freeze([
	kind('Narration', 'narration'), kind('Dialogue', 'dialogue'), kind('Music', 'music'), kind('SFX', 'sfx')
]);
export function createStudioAudioIntent() {
	return UI.section({ class: 'studio-intent-body studio-audio-intent', hidden: context => context.store.get('primaryIntent') !== 'audio' },
		UI.div({ class: 'studio-audio-tabs', role: 'tablist', 'aria-label': 'Audio type' }, ...AUDIO_KINDS.map(createKindButton)),
		createStudioAudioLayerList(),
		UI.label({ class: 'studio-audio-import-control' },
			UI.strong({ text: context => `Import ${audioKindLabel(context.store.get('audioImportKind'))}` }),
			UI.span({ text: 'Local audio becomes durable movie media and joins preview + MP4 export.' }),
			UI.input({ class: 'studio-audio-file-input', type: 'file', accept: 'audio/*', $on: { change: 'importStudioAudio' } })
		)
	);
}
function createKindButton(item) {
	return UI.button({ class: 'studio-audio-tab', type: 'button', 'data-audio-kind': item.kind,
		'aria-pressed': context => String(context.store.get('audioImportKind') === item.kind), $on: { click: 'selectStudioAudioImportKind' }, text: item.label });
}
function audioKindLabel(value) { return AUDIO_KINDS.find(item => item.kind === value)?.label || 'Music'; }
function kind(label, kindValue) { return Object.freeze({ label, kind: kindValue }); }
