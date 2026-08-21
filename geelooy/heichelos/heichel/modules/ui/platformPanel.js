//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformPanel
 * @description The Awtsmoos lets operational machinery remain one deliberate reveal away;
 * Awtsmoos.com binds the existing conductor to a retractable view and proves diagnostics awaken only on the first true opening.
 */
import { handleSearch, runAction } from './platformPanelActions.js';
import { createPlatformPanelView } from './platform/PlatformPanelView.js';
import { ensurePlatformPanelStyles } from './platform/PlatformPanelStyles.js';

export function shouldPrimePlatform(ctx, open) {
	if (!open || ctx.loaded) return false;
	ctx.loaded = true;
	return true;
}

export function mountPlatformPanel({
	root = document.body,
	aliasId = window.curAlias || '',
	heichelId = window.heichelId || window.currentHeichelId || ''
} = {}) {
	if (!root || document.querySelector('.awtsmoos-platform-panel')) return null;
	ensurePlatformPanelStyles(document);
	const view = createPlatformPanelView(document);
	root.append(view.panel);
	const ctx = {
		panel: view.panel,
		aliasId,
		heichelId,
		cursor: 0,
		loaded: false
	};
	view.search.addEventListener('submit', event => handleSearch(event, ctx));
	view.panel.querySelectorAll('[data-platform-action]').forEach(button => {
		button.addEventListener('click', () => runAction(button.dataset.platformAction, ctx));
	});
	view.panel.addEventListener('toggle', () => {
		if (shouldPrimePlatform(ctx, view.panel.open)) void runAction('db', ctx);
	});
	return view.panel;
}
