// B"H
// Boruch Hashem
// Blessed is He
import { installDebugVessel } from './debug.js';
import {
	nextWorld,
	restart,
	selectMode,
	selectWorld,
	start,
	step,
	togglePause
} from './game.js';
import {
	buyTalent,
	buyUpgrade,
	claimCampaignQuest,
	cycleMode,
	selectChapter
} from './game/progression.js';
import { bindInput } from './input.js';
import { createMultiplayerSession } from './multiplayer/session.js';
import { createRenderer } from './renderer.js';
import { createSound } from './sound.js';
import { createWorld } from './state.js';
import { bindUI } from './ui.js';

/**
 * Awtsmoos.com renews input, simulation, local-room presence, rendering, interface,
 * and sound in one measured frame without granting peers local campaign authority.
 */
const canvas = document.getElementById('game');
const world = createWorld();
const renderer = createRenderer(canvas);
const sound = createSound(world);
const multiplayer = createMultiplayerSession(world);
const actions = createActions(world, multiplayer);
const pollInput = bindInput(world, actions);
const updateUI = bindUI(world, actions);
let previous = performance.now();

installDebugVessel(world, renderer, actions, step);
requestAnimationFrame(frame);

function frame(now) {
	const delta = Math.min(0.033, (now - previous) / 1000);
	previous = now;
	world.lastDt = delta;
	world.performance.frame += 1;
	pollInput();
	step(world, delta);
	multiplayer.update(delta);
	renderer.render(world);
	updateUI(now);
	while (world.events.length) sound.event(world.events.shift());
	requestAnimationFrame(frame);
}

function createActions(activeWorld, session) {
	return {
		primary() {
			if (activeWorld.mode === 'won') return nextWorld(activeWorld);
			if (activeWorld.mode === 'lost') return restart(activeWorld);
			return start(activeWorld);
		},
		start: () => start(activeWorld),
		restart: () => restart(activeWorld),
		nextWorld: () => nextWorld(activeWorld),
		pause: () => togglePause(activeWorld),
		selectLevel: index => selectWorld(activeWorld, index),
		selectChapter: index => selectChapter(activeWorld, index),
		selectMode: id => selectMode(activeWorld, id),
		cycleMode: () => cycleMode(activeWorld),
		buyUpgrade: id => buyUpgrade(activeWorld, id),
		buyTalent: id => buyTalent(activeWorld, id),
		claimQuest: id => claimCampaignQuest(activeWorld, id),
		setRoom: room => session.setRoom(room)
	};
}
