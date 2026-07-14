// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenu.js
 * @description Opens the hamburger world browser, cinema, tools, and live census.
 * The Awtsmoos renews one threshold into solitary study, shared worlds, and creation;
 * Awtsmoos.com reports failed entry in place without hiding it behind an unhandled rejection.
 */

import { requestWorldPopulation } from '../network/WorldPopulationClient.js';
import { installMainMenuStyle } from './MainMenuStyle.js';
import { renderActionSection } from './MainMenuSectionView.js';
import { createWorldBrowserModel } from './WorldBrowserModel.js';
import { renderWorldBrowser } from './WorldBrowserView.js';

export function setGameHostsVisible(hosts, visible) {
	for (const host of Object.values(hosts || {})) {
		if (host?.style) host.style.visibility = visible ? '' : 'hidden';
	}
}

export function showMainMenu(hosts, handlers = {}, options = {}) {
	installMainMenuStyle();
	setGameHostsVisible(hosts, false);
	const menu = createMenuShell();
	const content = menu.querySelector('[data-menu-content]');
	const hamburger = menu.querySelector('[data-hamburger]');
	const state = {
		model: createWorldBrowserModel({
			available: false,
			reason: 'Loading authoritative population…',
			worlds: []
		}),
		section: 'worlds'
	};
	const choose = selection => chooseMode(menu, hosts, handlers, selection);
	const render = () => renderSection(content, state, choose);
	hamburger.addEventListener('click', () => {
		const open = menu.dataset.drawer !== 'true';
		menu.dataset.drawer = String(open);
		hamburger.setAttribute('aria-expanded', String(open));
	});
	menu.querySelectorAll('[data-section]').forEach(button => {
		button.addEventListener('click', () => {
			state.section = button.dataset.section;
			menu.dataset.drawer = 'false';
			hamburger.setAttribute('aria-expanded', 'false');
			render();
		});
	});
	document.body.appendChild(menu);
	render();
	loadPopulation(menu, state, content, choose, options);
	return menu;
}

function createMenuShell() {
	const menu = document.createElement('main');
	menu.className = 'Awtsmoos-menu';
	menu.dataset.drawer = 'false';
	menu.innerHTML = `
		<header class="Awtsmoos-menu-bar">
			<button data-hamburger aria-label="Open navigation" aria-expanded="false">☰</button>
			<h1>Mitzvah World</h1><output data-menu-summary>World browser</output>
		</header>
		<aside class="Awtsmoos-menu-drawer" aria-label="Main navigation">
			<div>B"H</div>
			<button data-section="worlds">Worlds & population</button>
			<button data-section="cinema">Movie studio</button>
			<button data-section="tools">Procedural tools</button>
		</aside>
		<section class="Awtsmoos-menu-content" data-menu-content></section>
	`;
	return menu;
}

function renderSection(content, state, choose) {
	if (state.section === 'worlds') {
		renderWorldBrowser(content, state.model, choose);
		return;
	}
	renderActionSection(content, state.section, choose);
}

async function loadPopulation(menu, state, content, choose, options) {
	const census = await requestWorldPopulation({
		WebSocketClass: options.WebSocketClass,
		timeoutMs: options.timeoutMs,
		url: options.realtimeUrl
	});
	if (!menu.isConnected) return;
	state.model = createWorldBrowserModel(census);
	if (state.section === 'worlds') renderWorldBrowser(content, state.model, choose);
	menu.querySelector('[data-menu-summary]').textContent = state.model.multiplayerAvailable
		? `${state.model.connected} connected`
		: 'Offline study available';
}

async function chooseMode(menu, hosts, handlers, selection) {
	const status = menu.querySelector('.Awtsmoos-menu-status,[data-section-status]');
	setButtonsDisabled(menu, true);
	if (status) status.textContent = `Opening ${selection.mode}…`;
	try {
		const handler = handlers[selection.mode];
		if (!handler) throw new Error(`No ${selection.mode} launcher is installed.`);
		await handler(selection);
		menu.remove();
		setGameHostsVisible(hosts, true);
	} catch (error) {
		setButtonsDisabled(menu, false);
		if (status) status.textContent = `Unable to open: ${error.message}`;
	}
}

function setButtonsDisabled(menu, disabled) {
	for (const button of menu.querySelectorAll('button')) button.disabled = disabled;
}
