//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorShell.js
 * The Awtsmoos renews tool, hierarchy, asset, viewport, property, command, and time as distinct vessels around one cinematic center;
 * Awtsmoos.com reveals a professional adaptive workstation where many creative disciplines remain one canonical editor.
 */

import { UI } from '../../../../../libs/AwtsmoosUI/src/index.js';
import { createStudioViewportPanel } from '../StudioViewportPanel.js';
import { createStudioCommandPalette } from './StudioCommandPalette.js';
import { createStudioInspector } from './StudioInspector.js';
import { createStudioMobileDock } from './StudioMobileDock.js';
import { createStudioPanelStack } from './StudioPanelStack.js';
import { createStudioTimelineDock } from './StudioTimelineDock.js';
import { createStudioToolRail } from './StudioToolRail.js';
import { createStudioTopBar } from './StudioTopBar.js';

export function createStudioEditorShell() {
	return UI.div(
		{
			class: 'studio-editor-shell',
			'data-studio-editor-shell': 'true',
			'data-editor-panel': context => context.store.get('activePanel'),
			'data-workspace-mode': context => context.store.get('workspaceMode'),
			'data-timeline-expanded': context => String(Boolean(context.store.get('timelineExpanded'))),
			'data-command-open': context => String(Boolean(context.store.get('commandPaletteOpen'))),
			'data-mobile-open': context => String(Boolean(context.store.get('mobilePanelOpen')))
		},
		createStudioTopBar(),
		UI.div({ class: 'studio-editor-body' }, createStudioToolRail(), createStudioPanelStack(), createStudioViewportPanel(), createStudioInspector()),
		createStudioTimelineDock(),
		createStudioMobileDock(),
		createStudioCommandPalette()
	);
}
