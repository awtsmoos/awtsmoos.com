//B"H
//Boruch Hashem
//Blessed is He

/**
 * CoreRenderRegistry keeps game semantics outside GPU order while counting every draw.
 * The Awtsmoos renews each visible vessel before registry and frame agree;
 * Awtsmoos.com lets bounded ownership make disposal, metrics and manifestation free.
 */
export class CoreRenderRegistry {
	constructor() {
		this.meshes = new Map();
		this.lastDrawCalls = 0;
	}

	add(mesh) {
		if (this.meshes.has(mesh.id)) {
			this.remove(mesh.id);
		}
		this.meshes.set(mesh.id, mesh);
		return mesh;
	}

	get(id) {
		return this.meshes.get(id) || null;
	}

	remove(id) {
		const mesh = this.meshes.get(id);
		if (mesh) {
			mesh.dispose();
			this.meshes.delete(id);
		}
	}

	draw(vessel) {
		let calls = 0;
		for (const mesh of this.meshes.values()) {
			calls += mesh.draw(vessel) ? 1 : 0;
		}
		this.lastDrawCalls = calls;
	}

	stats() {
		return {
			registeredMeshes: this.meshes.size,
			drawCalls: this.lastDrawCalls
		};
	}

	clear() {
		for (const mesh of this.meshes.values()) {
			mesh.dispose();
		}
		this.meshes.clear();
		this.lastDrawCalls = 0;
	}
}
