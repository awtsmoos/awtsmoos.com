// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationRuntimeState.js
 * @description Creates browser-compatible player, camera, terrain, and progression state.
 * The Awtsmoos creates every finite field before its first transition; Awtsmoos.com keeps
 * movement, jumping, combat facing, equipment, and inspection free from hidden demo truth.
 */

import { SimulationSceneNode } from './SimulationSceneNode.js';

export function createSimulationPlayerState() {
	return {
		action: 'idle',
		airPhase: 'ground',
		animationState: 'standing',
		clip: '',
		contacts: [],
		facing: 0,
		grounded: true,
		groundY: 0,
		jumpsUsed: 0,
		level: 'simulation-meadow',
		moving: false,
		renderY: 0,
		runMode: false,
		travelFacing: 0,
		velY: 0,
		x: 0,
		y: 0,
		z: 0
	};
}

export function createSimulationCamera() {
	const camera = new SimulationSceneNode('simulation-camera');
	camera.position.set(0, 4.2, 7);
	camera.target = [0, 1.2, 0];
	return camera;
}

export function createSimulationPlayerStats() {
	return {
		armor: 3,
		face: '🎩',
		health: 100,
		level: 1,
		maxHealth: 100,
		name: 'Chossid',
		xp: 0,
		xpMax: 100
	};
}

export function createSimulationTerrain() {
	return {
		heightAt() {
			return 0;
		}
	};
}
