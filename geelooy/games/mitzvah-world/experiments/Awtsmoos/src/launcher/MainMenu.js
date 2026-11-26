//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MainMenu.js
 * @description Orchestrates a small world browser, one cancellable launch transaction, and the measured real-WebGL menu warmup.
 * The Awtsmoos turns selection into passage without silence; Awtsmoos.com overlaps population and genuine GPU awakening,
 * then reports successful world publication back to the page authority so the blocking veil closes at the truthful boundary.
 */

import { createLaunchTransition } from './LaunchTransitionView.js';
import { runMainMenuLaunch } from './MainMenuLaunchTask.js?v=20260923-essential-restart-01';
import { loadMainMenuPopulation } from './MainMenuPopulation.js';
import { publishMainMenuRuntime } from './MainMenuRuntimePublication.js';
import { renderActionSection } from './MainMenuSectionView.js';
import { bindMainMenuNavigation, createMainMenuShell } from './MainMenuShell.js';
import { scheduleMainMenuWebGlPrewarm } from './MainMenuWebGlPrewarm.js';
import { setGameHostsVisible } from './MitzvahWorldLaunchContext.js';
import { installMainMenuStyle } from './MainMenuStyle.js';
import { createWorldBrowserModel } from './WorldBrowserModel.js';
import { renderWorldBrowser } from './WorldBrowserView.js';

/** @description Opens the world browser while game hosts remain inaccessible behind it. */
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
	scheduleMainMenuWebGlPrewarm(hosts.canvas, options.environment || globalThis, menu);
	return menu;
}

/** @description Runs one cancellable world launch and restores the menu after failure. */
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
		// B"H (15s pass): "loaded" now means EVERYTHING loaded. For the
		// simple meadow the veil stays truthful through the friendly-NPC
		// install instead of vanishing at first playability, naming the
		// stage while it runs; the wait is bounded and a failed or absent
		// friendly stage never traps the traveler.
		await waitForFriendlyNeighbors(options.environment || globalThis, transition, controller.signal);
		if (launchSerial !== state.launchSerial || controller.signal.aborted) return null;
		publishMainMenuRuntime(options.environment || globalThis, result);
		options.onWorldLaunchComplete?.(result);
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


/** @description Bounded, abort-aware wait until the simple world's friendly neighbors settle, keeping the launch veil truthful. */
async function waitForFriendlyNeighbors(environment, transition, signal) {
	const startedAt = Date.now();
	const deadline = startedAt + 150000;
	let simpleWorld = false;
	for (;;) {
		if (signal?.aborted) return;
		const diagnostics = environment?.AwtsmoosDiagnostics || null;
		if (!diagnostics) return;
		const policy = diagnostics.worldExperience;
		if (policy) {
			// Only the simple meadow owns the friendly-actors stage; richer
			// worlds keep their existing completion law untouched.
			if (policy.canonicalPromotion !== false) return;
			simpleWorld = true;
		}
		if (!simpleWorld) {
			// The post-playable policy may need a breath to appear after
			// first playability; without it there is nothing to wait for.
			if (Date.now() - startedAt > 10000) return;
		} else {
			const stage = diagnostics.simpleWorldFriendlyActorsStage;
			if (stage === 'ready') {
				transition.update({ message: 'Your neighbors have arrived.', stage: 'neighbors-arriving', progress: 0.97 });
				return;
			}
			if (stage === 'failed') {
				transition.update({ message: 'The world is ready; the neighbors could not arrive.', stage: 'neighbors-arriving', progress: 0.97 });
				return;
			}
			const sub = diagnostics.postPlayablePriorityStage;
			transition.update({
				message: sub && sub !== 'launched' ? `Your neighbors are arriving… (${sub})` : 'Your neighbors are arriving…',
				stage: 'neighbors-arriving',
				progress: 0.9
			});
		}
		if (Date.now() > deadline) return;
		await new Promise(resolve => setTimeout(resolve, 400));
	}
}

/** @description Cancels one launch attempt and restores interactive menu state safely. */
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

/** @description Renders the selected world-browser section into the shared content vessel. */
function renderSection(content, state, choose) {
	if (state.section === 'worlds') renderWorldBrowser(content, state.model, choose);
	else renderActionSection(content, state.section, choose);
}
