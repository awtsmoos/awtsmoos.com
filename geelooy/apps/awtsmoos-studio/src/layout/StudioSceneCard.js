//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioSceneCard.js
 * @description Projects one canonical scene as a compact filmstrip card without inventing screenshot imagery that the movie has not actually captured.
 * The Awtsmoos lets a scene reveal number, name, duration, dimensional mode, and real layer count while Awtsmoos.com keeps selection on the same scene ID the renderer knows.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
export function createStudioSceneCard() {
	return UI.button(
		{
			class: 'studio-scene studio-scene-card', type: 'button',
			$each: { items: context => context.store.get('movie.scenes', []) },
			'data-scene-id': context => context.data.item.id,
			'data-scene-mode': context => sceneMode(context.data.item),
			'aria-pressed': context => String(context.store.get('selectedSceneId') === context.data.item.id),
			'aria-label': context => `${context.data.item.name}, ${sceneMode(context.data.item)}, ${formatTime(context.data.item.duration)}`,
			$on: { click: 'selectScene' }
		},
		UI.span({ class: 'studio-scene-card-preview', text: context => modeGlyph(context.data.item), 'aria-hidden': 'true' }),
		UI.span({ class: 'studio-scene-card-copy' },
			UI.strong({ text: context => context.data.item.name }),
			UI.span({ text: context => `${sceneNumber(context)} · ${formatTime(context.data.item.duration)}` })
		),
		UI.span({ class: 'studio-scene-card-mode', text: context => sceneMode(context.data.item).toUpperCase() })
	);
}
export function sceneMode(scene) {
	const kinds = (scene?.layers || []).map(layer => String(layer.kind || ''));
	const has3d = kinds.some(kind => kind.endsWith('3d'));
	const has2d = kinds.some(kind => !kind.endsWith('3d') && !AUDIO_KINDS.has(kind));
	return has3d && has2d ? 'hybrid' : has3d ? '3d' : '2d';
}
function sceneNumber(context) {
	const scenes = context.store.get('movie.scenes', []);
	return `Scene ${Math.max(0, scenes.findIndex(scene => scene.id === context.data.item.id)) + 1}`;
}
function modeGlyph(scene) {
	const mode = sceneMode(scene);
	return mode === '3d' ? '◇' : mode === 'hybrid' ? '◫' : '▭';
}
function formatTime(seconds) {
	const value = Math.max(0, Math.round(Number(seconds) || 0));
	return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
const AUDIO_KINDS = new Set(['audio', 'dialogue', 'narration', 'music', 'ambience', 'sfx']);
