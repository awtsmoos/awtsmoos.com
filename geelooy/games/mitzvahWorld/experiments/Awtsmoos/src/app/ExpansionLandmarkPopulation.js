// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExpansionLandmarkPopulation.js
 * @description Owns gateway and highland landmarks while discovering each scene root exactly once.
 * The Awtsmoos joins valley and ridge through one visible threshold; Awtsmoos.com preserves every
 * interaction while repeated frames never retraverse an already witnessed highland tree.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createFallbackBoxMesh } from './EretzFallbackBoxMesh.js';
import { ExpansionLandmarkActor } from './ExpansionLandmarkActor.js';

export class ExpansionLandmarkPopulation {
	constructor(runtime) {
		this.runtime = runtime;
		this.camera = runtime.camera;
		this.group = new Group();
		this.group.name = 'Awtsmoos_expansion_landmark_population';
		this.actors = [];
		this.knownMeshes = new Set();
		this.discoveredRoots = new WeakSet();
		this.gateway = createGateway(runtime);
		this.group.add(this.gateway);
		runtime.scene.add(this.group);
		this.addActor(this.gateway, 'region:kedem-highlands');
		this.gatewayVisible = this.gateway.visible;
	}

	update() {
		const gatewayVisible = this.runtime.expansion?.regionId === 'lower-meadow';
		if (gatewayVisible !== this.gatewayVisible) {
			this.gateway.visible = gatewayVisible;
			this.gatewayVisible = gatewayVisible;
		}
		const highlands = this.runtime.regionPackages?.highlands;
		if (highlands && !this.discoveredRoots.has(highlands)) {
			this.discover(highlands);
			this.discoveredRoots.add(highlands);
		}
	}

	discover(root) {
		for (const mesh of descendants(root)) {
			const action = mesh.userData?.interaction
				|| (mesh.userData?.encounter
					? `encounter:${mesh.userData.encounter}`
					: null);
			if (action) this.addActor(mesh, action);
		}
	}

	addActor(mesh, action) {
		if (this.knownMeshes.has(mesh)) return;
		this.knownMeshes.add(mesh);
		this.actors.push(new ExpansionLandmarkActor(
			this.runtime,
			mesh,
			action
		));
	}

	clearAll() {
		for (const actor of this.actors) actor.clear();
	}

	diagnostics() {
		return Object.freeze({
			actors: this.actors.length,
			gatewayVisible: this.gateway.visible,
			regionId: this.runtime.expansion?.regionId || null
		});
	}

	destroy() {
		this.clearAll();
		this.group.parent?.remove(this.group);
		this.actors.length = 0;
		this.knownMeshes.clear();
	}
}

function createGateway(runtime) {
	const x = 112;
	const z = -100;
	const y = runtime.terrain.heightAt(x, z) + 3.5;
	const mesh = createFallbackBoxMesh(
		'Kedem_Highlands_Gateway',
		[5, 7, 2],
		[x, y, z],
		[0.35, 0.58, 0.78, 1]
	);
	mesh.userData.interaction = 'region:kedem-highlands';
	return mesh;
}

function descendants(root) {
	const result = [];
	const pending = [...(root.children || [])];
	while (pending.length) {
		const node = pending.shift();
		result.push(node);
		pending.push(...(node.children || []));
	}
	return result;
}
