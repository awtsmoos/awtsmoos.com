//B"H
//Boruch Hashem
//Blessed is He

/**
 * Browser bootstrap joins menu, devices, simulation, civic overlay, and rendering.
 * Open World overlay controller lazy-loads on first entry for fast boot.
 */

import { createInput } from './controls/input.js';
import { BrowserRuntime } from './core/BrowserRuntime.js';
import { bindMainLifecycle, returnFromVictory } from './core/MainLifecycle.js';
import { MenuFlow } from './menu/MenuFlow.js';
import { DeviceRegistry } from './multiplayer/DeviceRegistry.js';
import { applyMobileProfile, mobileProfile } from './platform/mobileProfile.js';
import { createRenderSurface } from './render/offscreenSurface.js';
import { readAudioMode, writeAudioMode } from './settings/audioSettings.js';
import { GameModel } from './session/GameModel.js';
import { MatchFlow } from './session/MatchFlow.js';

const canvas = document.getElementById('olam');
const overlay = document.getElementById('menuOverlay');
const civicOverlay = document.getElementById('openWorldOverlay');
const botSelect = document.getElementById('botSelect');
const soundSelect = document.getElementById('soundSelect');
const pause = document.getElementById('pauseToggle');
const restart = document.getElementById('restart');
const debug = document.getElementById('debugToggle');
const status = document.getElementById('statusText');
const profile = mobileProfile(window);
applyMobileProfile(document, profile);

const model = new GameModel();
const registry = new DeviceRegistry(navigator);
registry.assign('keyboard', model.lobby.slot(0).id);
model.lobby.syncConnections(registry);
const surface = createRenderSurface(canvas, profile);
const input = createInput(document, {
	canvas,
	getState: () => model.state,
	getSlots: () => model.inputSlots(),
	navigatorObject: navigator
});
let runtime;
let menuFlow;
let openWorldOverlay = null; // lazy: created on first open-world entry

const matchFlow = new MatchFlow({
	model,
	host: overlay,
	status,
	botSelect,
	profile,
	onReturnMenu: () => returnFromVictory(model, menuFlow),
	onSceneChange: () => runtime?.resetClock()
});

menuFlow = new MenuFlow({
	model,
	host: overlay,
	status,
	profile,
	soundSelect,
	botSelect,
	registry,
	onBeginMatch: (map, mode) => matchFlow.beginCountdown(map, mode),
	onBeginOpenWorld: beginOpenWorld,
	onCloseOpenWorld: () => openWorldOverlay?.closeForMenu()
});

runtime = new BrowserRuntime({
	model,
	input,
	canvas,
	surface,
	profile,
	onStep: () => {
		if (model.state.mode === 'openworld') openWorldOverlay?.update();
		else matchFlow.update();
	}
});

soundSelect.value = readAudioMode();
soundSelect.onchange = () => writeAudioMode(soundSelect.value);
overlay.addEventListener('click', event => {
	if (!matchFlow.handleClick(event)) menuFlow.handleClick(event);
});

bindMainLifecycle({
	botSelect,
	debug,
	matchFlow,
	menuFlow,
	model,
	pause,
	registry,
	restart,
	runtime
});

runtime.resize();
model.choice.cosmetic.ready ? menuFlow.showMode() : menuFlow.showCustomize();
runtime.start();

/** Enters open-world mode, lazy-loading its controller and frame stepper. */
async function beginOpenWorld() {
	status.textContent = 'Entering the city…';
	const [loopMod] = await Promise.all([import('./core/loop.js'), model.createOpenWorld()]);
	void loopMod.preloadOpenWorldStepper();
	if (!openWorldOverlay) {
		const { OpenWorldOverlayController } = await import('./menu/openworld/OpenWorldOverlayController.js');
		openWorldOverlay = new OpenWorldOverlayController({ host: civicOverlay, model, status });
	}
	overlay.classList.add('hidden');
	input.clear();
	runtime?.resetClock();
	openWorldOverlay.update();
}
