//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CreatorPersistenceTestFixture.js
 * @description Gives creator persistence tests one real semantic document and one tiny scene/octree vessel without hiding runtime side effects.
 * The Awtsmoos lets written identity become visible form while Awtsmoos.com keeps the test world small and true;
 * scene, collision, storage, UUID, and placement remain observable so save, reopening, remix, and rollback may all pass through.
 */

import { MitzvahWorldCreatorDocument } from '../../creator/MitzvahWorldCreatorDocument.js';
import { MitzvahWorldCreatorSandboxInventory } from '../../creator/MitzvahWorldCreatorSandboxInventory.js';
import { MitzvahWorldCreatorSession } from '../../creator/MitzvahWorldCreatorSession.js';
import { mitzvahWorldCreatorPart } from '../../creator/MitzvahWorldCreatorCatalog.js';

export function createCreatorEnvironment() {
	let sequence = 0;
	const values = new Map();
	return {
		crypto: {
			randomUUID() {
				sequence += 1;
				return `uuid-${sequence}`;
			}
		},
		localStorage: {
			getItem: key => values.get(key) ?? null,
			removeItem: key => values.delete(key),
			setItem: (key, value) => values.set(key, String(value))
		}
	};
}

export function createCreatorRuntime() {
	const colliders = new Set();
	const scene = {
		children: [],
		add(mesh) {
			mesh.parent = this;
			this.children.push(mesh);
		},
		remove(mesh) {
			this.children = this.children.filter(value => value !== mesh);
			mesh.parent = null;
		}
	};
	const runtime = {
		allowColliderInsert: true,
		cameraRig: { orbit: { yaw: 0 } },
		mainOctree: {
			insert(collider) {
				if (!runtime.allowColliderInsert) return false;
				colliders.add(collider);
				return true;
			},
			remove: collider => colliders.delete(collider)
		},
		scene,
		state: { facing: 0, groundY: 0, x: 0, y: 0, z: 0 },
		terrain: { heightAt: () => 0 }
	};
	return { colliders, runtime, scene };
}

export function createCreatorSessionFixture() {
	const environment = createCreatorEnvironment();
	const runtimeFixture = createCreatorRuntime();
	const previewAdapter = { clear() {}, show() {} };
	const session = new MitzvahWorldCreatorSession(runtimeFixture.runtime, {
		environment,
		inventory: new MitzvahWorldCreatorSandboxInventory(),
		previewAdapter
	});
	return { environment, ...runtimeFixture, session };
}

export async function createPortableCreatorWorld(environment, id = 'creator-timber-wall-0042') {
	const documentStore = new MitzvahWorldCreatorDocument({ environment });
	const part = mitzvahWorldCreatorPart('timber-wall');
	await documentStore.createPart(part, creatorDefinition(id));
	return {
		document: documentStore.document,
		json: documentStore.serialize(),
		worldId: documentStore.document.metadata.mitzvahWorldCreator.worldId
	};
}

export function creatorDefinition(id, overrides = {}) {
	return {
		color: '#ffffff',
		id,
		position: { x: 1, y: 1, z: 1 },
		rotation: { y: 0 },
		shape: 'box',
		size: { x: 1, y: 2, z: 0.25 },
		solid: true,
		userData: { AwtsmoosCreatorPart: 'timber-wall' },
		walkable: false,
		...overrides
	};
}
