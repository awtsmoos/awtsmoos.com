//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioHeader.js
 * @description Makes the current movie the primary mobile identity while keeping one real Export door and specialist links nearby.
 * The Awtsmoos names the project before the tools around it; Awtsmoos.com keeps scene and time context compact so the cinematic stage remains the visual throne.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
export function createStudioHeader() {
	return UI.header({ class: 'aw-ui-bar studio-header' },
		UI.div({ class: 'studio-header-project' },
			UI.h1({ class: 'studio-title', text: context => context.store.get('movie.title') || 'Untitled Movie' }),
			UI.span({ class: 'aw-ui-muted studio-subtitle', text: projectContext })
		),
		UI.span({ class: 'aw-ui-spacer' }),
		createStudioLink('Animator', '../animator/'), createStudioLink('Nesher', '../nesher-studio/'),
		UI.button({ class: 'studio-header-export', type: 'button', $on: { click: 'openStudioExport' }, text: 'Export' })
	);
}
function projectContext(context) {
	const scenes = context.store.get('movie.scenes', []);
	const selectedId = context.store.get('selectedSceneId');
	const index = Math.max(0, scenes.findIndex(item => item.id === selectedId));
	return `Scene ${index + 1} · ${formatTime(context.store.get('playhead'))} / ${formatTime(context.store.get('movie.duration'))}`;
}
function formatTime(value) {
	const seconds = Math.max(0, Math.floor(Number(value) || 0));
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
function createStudioLink(text, href) { return UI.a({ class: 'aw-ui-button studio-link', href, text }); }
