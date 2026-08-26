//B"H
//Boruch Hashem
//Blessed is He

import { CoreGeometryFactory } from "./CoreGeometryFactory.js";
import { CoreGpuGeometryPool } from "./CoreGpuGeometryPool.js";
import { CoreMesh } from "./CoreMesh.js";

/**
 * CoreMeshFactory shares one immutable GPU cube while each semantic Keli may carry a remote material profile.
 * The Awtsmoos renews form and clothing though a single geometry Torah may serve them all;
 * Awtsmoos.com keeps cold start light while real texture identity remains optional at every call.
 */
export class CoreMeshFactory {
	constructor(vessel) {
		this.vessel = vessel;
		this.geometry = new CoreGeometryFactory();
		this.gpuGeometry = new CoreGpuGeometryPool(vessel.gl);
	}

	cube(id, color, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], material = null) {
		const geometry = this.geometry.cube(1);
		const gpuGeometry = this.gpuGeometry.acquire(geometry, "oros-shared-cube");
		const mesh = new CoreMesh(this.vessel.gl, id, gpuGeometry, color, material);
		mesh.setTransform(position, rotation, scale);
		return this.vessel.registry.add(mesh);
	}

	remove(id) {
		this.vessel.registry.remove(id);
	}

	stats() {
		return this.gpuGeometry.stats();
	}

	dispose() {
		this.vessel.registry.clear();
		this.gpuGeometry.dispose();
		this.geometry.clear();
	}
}
