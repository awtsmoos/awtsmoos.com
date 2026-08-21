//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformPanelView
 * @description The Awtsmoos lets operational depth exist without shouting over a Space;
 * Awtsmoos.com builds Advanced Platform with safe DOM, four near tools, ten retractable tools, search, status, and one output well.
 */
import { createProgressiveDisclosure } from '../../../../../shared/social/ui/ProgressiveDisclosure.js';
import {
	ADVANCED_PLATFORM_ACTIONS,
	PRIMARY_PLATFORM_ACTIONS
} from './PlatformActionCatalog.js';

function actionButton(document, [id, label]) {
	const button = document.createElement('button');
	button.type = 'button';
	button.dataset.platformAction = id;
	button.className = 'awtsmoos-platform-action';
	button.textContent = label;
	return button;
}

function actionGrid(document, actions, className) {
	const grid = document.createElement('div');
	grid.className = className;
	for (const action of actions) grid.append(actionButton(document, action));
	return grid;
}

function searchForm(document) {
	const form = document.createElement('form');
	form.className = 'awtsmoos-platform-search';
	const input = document.createElement('input');
	input.name = 'q';
	input.type = 'search';
	input.placeholder = 'Search posts, graph, comments';
	input.setAttribute('aria-label', 'Search the social platform');
	const button = document.createElement('button');
	button.type = 'submit';
	button.textContent = 'Search';
	form.append(input, button);
	return form;
}

function panelHeader(document) {
	const header = document.createElement('header');
	const copy = document.createElement('div');
	const kicker = document.createElement('small');
	kicker.textContent = 'Power tools';
	const title = document.createElement('strong');
	title.textContent = 'Awtsmoos Platform';
	const status = document.createElement('small');
	status.dataset.platformStatus = '';
	status.textContent = 'ready';
	copy.append(kicker, title);
	header.append(copy, status);
	return header;
}

export function createPlatformPanelView(document = globalThis.document) {
	const body = document.createElement('section');
	body.className = 'awtsmoos-platform-body';
	const primary = actionGrid(document, PRIMARY_PLATFORM_ACTIONS, 'awtsmoos-platform-actions awtsmoos-platform-actions--primary');
	const advancedGrid = actionGrid(document, ADVANCED_PLATFORM_ACTIONS, 'awtsmoos-platform-actions awtsmoos-platform-actions--advanced');
	const more = createProgressiveDisclosure({
		document,
		label: 'More tools',
		detail: `${ADVANCED_PLATFORM_ACTIONS.length}`,
		content: advancedGrid,
		variant: 'compact',
		className: 'awtsmoos-platform-more'
	});
	const output = document.createElement('div');
	output.className = 'awtsmoos-platform-output';
	output.dataset.platformOutput = '';
	body.append(panelHeader(document), searchForm(document), primary, more.root, output);
	const shell = createProgressiveDisclosure({
		document,
		label: 'Advanced',
		detail: 'platform tools',
		content: body,
		variant: 'advanced',
		className: 'awtsmoos-platform-panel'
	});
	return { panel: shell.root, body, output, search: body.querySelector('.awtsmoos-platform-search') };
}

export { actionButton, actionGrid, panelHeader, searchForm };
