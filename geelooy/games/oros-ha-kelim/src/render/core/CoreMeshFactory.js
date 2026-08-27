//B"H
//Boruch Hashem
//Blessed is He

import { CoreGeometryFactory } from "./CoreGeometryFactory.js";
import { CoreGpuGeometryPool } from "./CoreGpuGeometryPool.js";
import { CoreMesh } from "./CoreMesh.js";

/**
 * CoreMeshFactory shares CPU geometry and one immutable GPU manifestation across semantic cube Keilim.
 * The Awtsmoos renews each visible meaning while one geometric Torah may serve them all;
 * Awtsmoos.com keeps cold start and trail growth light by preventing duplicate buffer calls.
 */
export class CoreMeshFactory {
	constructor(vessel) {
		this.vessel = vessel;
		this.geometry = new CoreGeometryFactory();
		this.gpuGeometry = new CoreGpuGeometryPool(vessel.gl);
	}

	cube(id, color, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
		const geometry = this.geometry.cube(1);
		const gpuGeometry = this.gpuGeometry.acquire(geometry, "oros-shared-cube");
		const mesh = new CoreMesh(this.vessel.gl, id, gpuGeometry, color);
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
