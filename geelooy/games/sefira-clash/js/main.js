//B"H
//Boruch Hashem
//Blessed is He

/**
 * Browser bootstrap joins menu, devices, simulation, and rendering in Awtsmoos.com.
 * The Awtsmoos renews every local controller as its own vessel while Adventure
 * retains the proven single-human path through the same focused runtime.
 */
import { createInput } from './controls/input.js';
import { BrowserRuntime } from './core/BrowserRuntime.js';
import { MenuFlow } from './menu/MenuFlow.js';
import { DeviceRegistry } from './multiplayer/DeviceRegistry.js';
import { applyMobileProfile, mobileProfile } from './platform/mobileProfile.js';
import { createRenderSurface } from './render/offscreenSurface.js';
import { readAudioMode, writeAudioMode } from './settings/audioSettings.js';
import { GameModel } from './session/GameModel.js';
import { MatchFlow } from './session/MatchFlow.js';

const canvas = document.getElementById('olam');
const overlay = document.getElementById('menuOverlay');
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
let menuFlow;
let runtime;

const matchFlow = new MatchFlow({
	model,
	host: overlay,
	status,
	botSelect,
	profile,
	onReturnMenu: () => menuFlow.showMode(),
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
	onBeginMatch: (map, mode) => matchFlow.beginCountdown(map, mode)
});

runtime = new BrowserRuntime({
	model,
	input,
	canvas,
	surface,
	profile,
	onStep: () => matchFlow.update()
});

soundSelect.value = readAudioMode();
soundSelect.onchange = () => writeAudioMode(soundSelect.value);
overlay.addEventListener('click', event => {
	if (!matchFlow.handleClick(event)) {
		menuFlow.handleClick(event);
	}
});
restart.onclick = () => menuFlow.showMode();
botSelect.onchange = () => restartAdventureIfActive(model, matchFlow);
debug.onclick = () => {
	model.state.debug = !model.state.debug;
};
addEventListener('resize', () => runtime.resize());
addEventListener('orientationchange', () => setTimeout(() => runtime.resize(), 140));
addEventListener('gamepadconnected', refreshDevices);
addEventListener('gamepaddisconnected', refreshDevices);

function refreshDevices() {
	registry.refresh();
	model.lobby.syncConnections(registry);
	menuFlow.refreshVsLobby();
}

function restartAdventureIfActive(gameModel, flow) {
	const active = ['playing', 'victory'].includes(gameModel.state.phase);
	if (gameModel.choice.mode === 'adventure' && active) {
		flow.beginCountdown(gameModel.choice.map, 'adventure');
	}
}

runtime.resize();
model.choice.cosmetic.ready ? menuFlow.showMode() : menuFlow.showCustomize();
runtime.start();
