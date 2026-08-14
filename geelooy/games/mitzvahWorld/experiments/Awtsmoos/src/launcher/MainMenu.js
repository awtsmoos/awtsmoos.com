// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenu.js
 * @description Orchestrates a small world browser and one cancellable launch transaction.
 * The Awtsmoos turns selection into passage without silence; Awtsmoos.com separates shell,
 * census, transition, and bounded launch so each threshold remains observable and reversible.
 */

import { createLaunchTransition } from './LaunchTransitionView.js';
import { runMainMenuLaunch } from './MainMenuLaunchTask.js?v=20260722-launch-task-01';
import { loadMainMenuPopulation } from './MainMenuPopulation.js';
import { publishMainMenuRuntime } from './MainMenuRuntimePublication.js';
import { renderActionSection } from './MainMenuSectionView.js';
import { bindMainMenuNavigation, createMainMenuShell } from './MainMenuShell.js';
import { installMainMenuStyle } from './MainMenuStyle.js';
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
	const menu = createMainMenuShell();
	const content = menu.querySelector('[data-menu-content]');
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
	choose = selection => chooseMode({
		handlers,
		hosts,
		menu,
		options,
		render,
		selection,
		state
	});
	bindMainMenuNavigation(menu, state, render);
	document.body.appendChild(menu);
	render();
	void loadMainMenuPopulation(menu, state, options, render);
	return menu;
}

async function chooseMode(context) {
	const { handlers, hosts, menu, options, render, selection, state } = context;
	const handler = handlers[selection.mode];
	const launchSerial = ++state.launchSerial;
	const controller = new AbortController();
	const restore = () => restoreMenu({
		controller,
		hosts,
		launchSerial,
		menu,
		render,
		state
	});
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
		publishMainMenuRuntime(options.environment || globalThis, result);
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

function restoreMenu(context) {
	const { controller, hosts, launchSerial, menu, render, state } = context;
	if (launchSerial !== state.launchSerial) return;
	state.launchSerial += 1;
	controller.abort();
	menu.dataset.launching = 'false';
	setGameHostsVisible(hosts, false);
	for (const button of menu.querySelectorAll('button')) button.disabled = false;
	render();
}

function renderSection(content, state, choose) {
	if (state.section === 'worlds') renderWorldBrowser(content, state.model, choose);
	else renderActionSection(content, state.section, choose);
}
