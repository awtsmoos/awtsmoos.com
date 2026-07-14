//B"H
//Boruch Hashem
//Blessed is He

/**
 * Browser bootstrap joins menu, devices, simulation, civic overlay, and rendering in
 * Awtsmoos.com. The Awtsmoos renews every local controller while Open World, Expedition,
 * Adventure, and VS enter explicit mode-honest flows through one tested runtime.
 */

import { createInput } from './controls/input.js';
import { BrowserRuntime } from './core/BrowserRuntime.js';
import { bindMainLifecycle, returnFromVictory } from './core/MainLifecycle.js';
import { MenuFlow } from './menu/MenuFlow.js';
import { OpenWorldOverlayController } from './menu/openworld/OpenWorldOverlayController.js';
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

const openWorldOverlay = new OpenWorldOverlayController({
	host: civicOverlay,
	model,
	status
});

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
	onCloseOpenWorld: () => openWorldOverlay.closeForMenu()
});

runtime = new BrowserRuntime({
	model,
	input,
	canvas,
	surface,
	profile,
	onStep: () => {
		if (model.state.mode === 'openworld') openWorldOverlay.update();
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
	registry,
	restart,
	runtime
});

runtime.resize();
model.choice.cosmetic.ready ? menuFlow.showMode() : menuFlow.showCustomize();
runtime.start();

function beginOpenWorld() {
	model.createOpenWorld();
	overlay.classList.add('hidden');
	input.clear();
	runtime?.resetClock();
	openWorldOverlay.update();
}
