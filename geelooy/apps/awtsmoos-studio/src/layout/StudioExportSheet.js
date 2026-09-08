//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioExportSheet.js
 * @description Presents real native MP4 settings, soundtrack inclusion, progress, and one unmistakable export action in a phone-first modal vessel.
 * The Awtsmoos lets final form approach without replacing the movie; Awtsmoos.com shows only choices the encoder truly receives, with progress drawn from actual frames.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { STUDIO_EXPORT_FPS, STUDIO_EXPORT_RESOLUTIONS } from '../export/StudioExportSettings.js';
export function createStudioExportSheet() {
	return UI.aside(
		{ class: 'studio-export-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Export movie', hidden: context => !context.store.get('exportOpen') },
		UI.div(
			{ class: 'studio-export-card' },
			createHeader(),
			UI.div({ class: 'studio-export-preview' },
				UI.strong({ text: context => context.store.get('movie.title') || 'Current movie' }),
				UI.span({ text: context => `${context.store.get('movie.scenes', []).length} scenes · native WebGL + overlays` })
			),
			createChoiceGroup('Resolution', Object.keys(STUDIO_EXPORT_RESOLUTIONS), 'exportResolution', 'selectStudioExportResolution', 'export-resolution'),
			createChoiceGroup('Frame Rate', STUDIO_EXPORT_FPS, 'exportFps', 'selectStudioExportFps', 'export-fps'),
			UI.button({ class: 'studio-export-audio', type: 'button', 'aria-pressed': context => String(context.store.get('exportIncludeAudio')),
				$on: { click: 'toggleStudioExportAudio' }, text: context => `Include Audio · ${context.store.get('exportIncludeAudio') ? 'On' : 'Off'}` }),
			UI.button({ class: 'studio-export-submit', type: 'button', disabled: context => context.store.get('exporting'),
				$on: { click: 'runStudioExport' }, text: context => context.store.get('exporting') ? 'Rendering…' : 'Export Video' }),
			UI.div({ class: 'studio-export-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100',
				'aria-valuenow': context => String(context.store.get('exportProgress') || 0) },
				UI.span({ style: context => `width:${Math.max(0, Math.min(100, Number(context.store.get('exportProgress') || 0)))}%` })
			),
			UI.p({ class: 'studio-export-status', 'aria-live': 'polite', text: context => context.store.get('exportStatus') || 'Ready to export.' })
		)
	);
}
function createHeader() {
	return UI.header({ class: 'studio-export-header' }, UI.strong({ text: 'Export' }),
		UI.button({ type: 'button', class: 'studio-export-close', 'aria-label': 'Close export', $on: { click: 'closeStudioExport' }, text: '×' }));
}
function createChoiceGroup(label, values, stateKey, action, dataKey) {
	return UI.section({ class: 'studio-export-group' }, UI.strong({ text: label }),
		UI.div({ class: 'studio-export-options' }, ...values.map(value => UI.button({ type: 'button', class: 'studio-export-option',
			[`data-${dataKey}`]: String(value), 'aria-pressed': context => String(String(context.store.get(stateKey)) === String(value)),
			$on: { click: action }, text: String(value).toUpperCase() }))));
}
