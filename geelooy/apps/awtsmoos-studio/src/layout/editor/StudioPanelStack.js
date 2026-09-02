//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPanelStack.js
 * The Awtsmoos renews every hidden capability without forcing all hidden matter into the first visible breath;
 * Awtsmoos.com instantiates only the chosen hierarchy, assets, Core, project, AI, or advanced chamber, preserving total power while the canvas appears with depth.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioAiPanel } from './StudioAiPanel.js';
import { createStudioAdvancedPanel } from './StudioAdvancedPanel.js';
import { createStudioAssetsPanel } from './StudioAssetsPanel.js';
import { createStudioCreatePanel } from './StudioCreatePanel.js';
import { createStudioOutliner } from './StudioOutliner.js';
import { createStudioProceduralPanel } from './StudioProceduralPanel.js';
import { createStudioProjectPanel } from './StudioProjectPanel.js';

/** Build the sidebar schema while deferring every inactive panel's DOM construction. */
export function createStudioPanelStack() {
	return UI.aside(
		{ class: 'studio-editor-sidebar', 'data-studio-sidebar': 'true' },
		UI.div(
			{ class: 'studio-mobile-sheet-handle' },
			UI.span({ text: 'Studio Panel' }),
			UI.button({ class: 'studio-panel-close', text: 'Done', $on: { click: 'closeMobilePanel' } })
		),
		createLazyPanel('objects', createStudioOutliner()),
		createLazyPanel('assets', createStudioAssetsPanel()),
		createLazyPanel('create', createStudioCreatePanel()),
		createLazyPanel('procedural', createStudioProceduralPanel()),
		createLazyPanel('projects', createStudioProjectPanel()),
		createLazyPanel('ai', createStudioAiPanel()),
		createLazyPanel('advanced', createStudioAdvancedPanel())
	);
}

/** Create one panel whose descendants are built only while that panel is active. */
export function createStudioLazyPanel(id, content) {
	return createLazyPanel(id, content);
}

function createLazyPanel(id, content) {
	return UI.div({
		class: 'studio-panel-pane',
		'data-panel': id,
		$when: context => context.store.get('activePanel') === id
	}, content);
}
