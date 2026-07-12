// B"H
import { directorSummary, forceBoss, forceEvent } from './director/director.js';
import { nextWorld, restart, selectMode, selectWorld, start, step, togglePause } from './game.js';
import { cycleMode } from './game/progression.js';
import { bindInput } from './input.js';
import { createRenderer } from './renderer.js';
import { createSound } from './sound.js';
import { createWorld } from './state.js';
import { bindUI } from './ui.js';

const canvas = document.getElementById('game');
const world = createWorld();
const renderer = createRenderer(canvas);
const sound = createSound(world);
const actions = createActions(world);
const pollInput = bindInput(world, actions);
const updateUI = bindUI(world, actions);
let previous = performance.now();

installDebugVessel(world, renderer, actions);
requestAnimationFrame(frame);

function frame(now) {
	const delta = Math.min(0.033, (now - previous) / 1000);
	previous = now;
	world.lastDt = delta;
	world.performance.frame += 1;
	pollInput();
	step(world, delta);
	renderer.render(world);
	updateUI();
	while (world.events.length) sound.event(world.events.shift());
	requestAnimationFrame(frame);
}

function createActions(activeWorld) {
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
		selectMode: id => selectMode(activeWorld, id),
		cycleMode: () => cycleMode(activeWorld)
	};
}

function installDebugVessel(activeWorld, activeRenderer, activeActions) {
	window.nitzotzDebug = {
		world: activeWorld,
		renderer: activeRenderer,
		actions: activeActions,
		start() {
			activeActions.start();
			return this.sample();
		},
		move(x = 0, y = -1, pulse = 0) {
			activeWorld.input.x = x;
			activeWorld.input.y = y;
			activeWorld.input.pulse = pulse;
			return this.sample();
		},
		selectMode(id) {
			activeActions.selectMode(id);
			return this.sample();
		},
		forceEvent(id = null) {
			forceEvent(activeWorld, id);
			return this.sample();
		},
		forceBoss() {
			forceBoss(activeWorld);
			return this.sample();
		},
		advance(seconds = 1) {
			for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) step(activeWorld, 1 / 60);
			return this.sample();
		},
		sample() {
			const remaining = activeWorld.level.objects.filter(object => !object.taken);
			return sampleWorld(activeWorld, activeRenderer, remaining);
		}
	};
}

function sampleWorld(activeWorld, activeRenderer, remaining) {
	return {
		mode: activeWorld.mode,
		gameMode: { id: activeWorld.gameMode.id, name: activeWorld.gameMode.name },
		level: activeWorld.level.name,
		mass: activeWorld.player.mass,
		rank: activeWorld.rank,
		time: activeWorld.timeLeft,
		objects: activeWorld.level.objects.length,
		remaining: remaining.length,
		traffic: remaining.filter(object => object.traffic).length,
		pedestrians: remaining.filter(object => object.pedestrian).length,
		compositeModels: remaining.filter(object => object.shape.startsWith('model:')).length,
		powerups: { ...activeWorld.powerups },
		rivals: activeWorld.rivals.map(rival => ({ name: rival.name, archetype: rival.archetype.name, mass: rival.mass })),
		director: directorSummary(activeWorld),
		achievements: Object.keys(activeWorld.save.achievements).length,
		webglError: activeRenderer.gl.getError(),
		message: activeWorld.message
	};
}
