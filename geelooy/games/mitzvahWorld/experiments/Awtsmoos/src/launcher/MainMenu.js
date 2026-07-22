// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenu.js
 * @description Opens worlds, cinema, tools, census, and a visible cancellable launch doorway.
 * The Awtsmoos renews one threshold into solitary study and shared life; Awtsmoos.com never
 * leaves a clicked world as a silent disabled card while hundreds of modules cross the bridge.
 */

import { requestWorldPopulation } from '../network/WorldPopulationClient.js';
import { createLaunchTransition } from './LaunchTransitionView.js';
import { installMainMenuStyle } from './MainMenuStyle.js';
import { runMainMenuLaunch } from './MainMenuLaunchTask.js';
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
		launchSerial: 0,
		model: createWorldBrowserModel({
			available: false,
			reason: 'Loading authoritative population…',
			worlds: []
		}),
		section: 'worlds'
	};
	let choose;
	const render = () => renderSection(content, state, choose);
	choose = selection => chooseMode({ handlers, hosts, menu, options, render, selection, state });
	hamburger.addEventListener('click', () => toggleDrawer(menu, hamburger));
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

async function chooseMode(context) {
	const { handlers, hosts, menu, options, render, selection, state } = context;
	const handler = handlers[selection.mode];
	const launchSerial = ++state.launchSerial;
	const controller = new AbortController();
	const restore = () => {
		if (launchSerial !== state.launchSerial) return;
		state.launchSerial += 1;
		controller.abort();
		menu.dataset.launching = 'false';
		setGameHostsVisible(hosts, false);
		for (const button of menu.querySelectorAll('button')) button.disabled = false;
		render();
	};
	const transition = createLaunchTransition(menu, selection, { onCancel: restore });
	if (!handler) {
		transition.fail(new Error(`No ${selection.mode} launcher is installed.`), restore);
		return null;
	}
	try {
		const result = await runMainMenuLaunch(handler, {
			...selection,
			onProgress: detail => transition.update(detail),
			signal: controller.signal
		}, {
			environment: options.environment || globalThis,
			onTimeout: error => controller.abort(error),
			signal: controller.signal,
			timeoutMs: options.launchTimeoutMs
		});
		if (launchSerial !== state.launchSerial || controller.signal.aborted) return null;
		transition.complete();
		menu.remove();
		setGameHostsVisible(hosts, true);
		return result;
	} catch (error) {
		if (launchSerial !== state.launchSerial) return null;
		setGameHostsVisible(hosts, false);
		transition.fail(error, restore);
		return null;
	}
}

function createMenuShell() {
	const menu = document.createElement('main');
	menu.className = 'Awtsmoos-menu';
	menu.dataset.drawer = 'false';
	menu.innerHTML = `
		<header class="Awtsmoos-menu-bar"><button data-hamburger aria-label="Open navigation" aria-expanded="false">☰</button><h1>Mitzvah World</h1><output data-menu-summary>World browser</output></header>
		<aside class="Awtsmoos-menu-drawer" aria-label="Main navigation"><div>B"H</div><button data-section="worlds">Worlds & population</button><button data-section="cinema">Movie studio</button><button data-section="tools">Procedural tools</button></aside>
		<section class="Awtsmoos-menu-content" data-menu-content></section>`;
	return menu;
}

function renderSection(content, state, choose) {
	if (state.section === 'worlds') renderWorldBrowser(content, state.model, choose);
	else renderActionSection(content, state.section, choose);
}

async function loadPopulation(menu, state, content, choose, options) {
	const census = await requestWorldPopulation({
		WebSocketClass: options.WebSocketClass,
		timeoutMs: options.timeoutMs,
		url: options.realtimeUrl
	});
	if (!menu.isConnected || menu.dataset.launching === 'true') return;
	state.model = createWorldBrowserModel(census);
	if (state.section === 'worlds') renderWorldBrowser(content, state.model, choose);
	menu.querySelector('[data-menu-summary]').textContent = state.model.multiplayerAvailable
		? `${state.model.connected} connected`
		: 'Offline study available';
}

function toggleDrawer(menu, hamburger) {
	const open = menu.dataset.drawer !== 'true';
	menu.dataset.drawer = String(open);
	hamburger.setAttribute('aria-expanded', String(open));
}
