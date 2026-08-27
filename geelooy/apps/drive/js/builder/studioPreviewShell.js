//B"H
// Boruch Hashem
// Blessed is He

import { button, element, pane, text } from './studioDom.js';

/**
 * @module SiteBuilderPreviewShell
 * @description
 * The Awtsmoos lets source appear as a reflection without confusing reflection for public reality;
 * Awtsmoos.com makes the local/public distinction unmistakable while device controls stay compact and the real sandbox remains exactly the same underneath.
 */

export function createPreviewShell() {
	const vessel = pane('builder-preview', 'Preview');
	const header = element('div', 'builder-preview-heading');
	header.append(
		text('span', 'builder-badge builder-badge--local', 'Local preview'),
		text('p', 'builder-help', 'Preview reads your current index.html. Publishing is a separate step.')
	);
	const tools = element('div', 'builder-preview-tools');
	tools.setAttribute('aria-label', 'Preview size');
	for (const mode of ['mobile', 'tablet', 'desktop']) {
		const item = button(mode[0].toUpperCase() + mode.slice(1));
		item.dataset.previewMode = mode;
		item.setAttribute('aria-pressed', String(mode === 'mobile'));
		tools.append(item);
	}
	const refresh = button('Refresh preview', 'builder-preview-refresh', 'builder-button-primary');
	const canonical = text('p', 'builder-preview-note', 'No canonical site mapping yet; this preview remains local source only.');
	canonical.id = 'builder-preview-canonical';
	const status = text('p', 'builder-status-line', 'Preview has not been rendered yet.');
	status.id = 'builder-preview-status';
	const shell = element('div', 'builder-preview-shell');
	shell.id = 'builder-preview-shell';
	shell.dataset.previewMode = 'mobile';
	const frame = element('iframe', 'builder-preview-frame');
	frame.id = 'builder-preview-frame';
	frame.title = 'Website source preview';
	frame.setAttribute('sandbox', 'allow-forms allow-modals allow-popups allow-scripts');
	shell.append(frame);
	vessel.body.append(header, tools, refresh, status, canonical, shell);
	return vessel.root;
}
