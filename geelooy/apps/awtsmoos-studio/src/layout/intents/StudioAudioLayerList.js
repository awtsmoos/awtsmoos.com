//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioAudioLayerList.js
 * @description Lists only real canonical imported audio layers for the selected semantic category and lets the same timeline action select them.
 * The Awtsmoos gives speech, song, and sound honest duration while Awtsmoos.com refuses invented stock cards, fake waveforms, or asset names that never entered the movie.
 */
import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
export function createStudioAudioLayerList() {
	return UI.div({ class: 'studio-audio-library' },
		UI.p({ class: 'studio-audio-empty', hidden: context => deriveStudioAudioLayers(context).length > 0,
			text: context => `No ${String(context.store.get('audioImportKind') || 'music')} clips yet. Import one below.` }),
		UI.button({ class: 'studio-audio-card', type: 'button', $each: { items: deriveStudioAudioLayers },
			'data-scene-id': context => context.data.item.sceneId, 'data-layer-id': context => context.data.item.layerId,
			'data-layer-start': context => String(context.data.item.start), $on: { click: 'selectTimelineLayer' } },
			UI.span({ class: 'studio-audio-card-kind', text: context => kindGlyph(context.data.item.kind), 'aria-hidden': 'true' }),
			UI.span({ class: 'studio-audio-card-copy' }, UI.strong({ text: context => context.data.item.name }),
				UI.span({ text: context => `${context.data.item.kind} · ${formatDuration(context.data.item.duration)}` })),
			UI.span({ class: 'studio-audio-card-add', text: '›', 'aria-hidden': 'true' })
		)
	);
}
export function deriveStudioAudioLayers(context) {
	const selectedKind = String(context.store.get('audioImportKind') || 'music');
	return (context.store.get('movie.scenes', []) || []).flatMap(scene => (scene.layers || [])
		.filter(layer => String(layer.kind) === selectedKind)
		.map(layer => ({ sceneId: scene.id, layerId: layer.id, kind: layer.kind,
			name: layer.data?.assetName || layer.id, duration: Number(layer.duration || 0),
			start: Number(scene.start || 0) + Number(layer.start || 0) })));
}
function kindGlyph(kind) { return kind === 'narration' || kind === 'dialogue' ? '◉' : kind === 'music' ? '♫' : '♪'; }
function formatDuration(seconds) {
	const value = Math.max(0, Math.round(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
