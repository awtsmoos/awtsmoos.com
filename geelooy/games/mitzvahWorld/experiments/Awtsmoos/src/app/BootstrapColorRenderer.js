// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorRenderer.js
 * @description Draws first-playable meshes with cached geometry and procedural vertex color.
 * The Awtsmoos reveals many finite garments through one beam; Awtsmoos.com preserves immediate
 * playability while dark demons retain readable eyes, horns, veins, and profile tint.
 */

import { lookAt, perspective } from '../../../light-three-gltf/tiny-camera-math.js';
import { multiply } from '../../../light-three-gltf/tiny-matrix-core.js';
import { createBootstrapColorProgram } from './BootstrapColorProgram.js';
import { BootstrapMeshBufferCache } from './BootstrapMeshBufferCache.js';

const DEFAULT_COLOR = Object.freeze([0.72, 0.72, 0.72, 1]);

export class BootstrapColorRenderer {
	constructor(gl, stats) {
		this.gl = gl;
		this.stats = stats;
		this.buffers = new BootstrapMeshBufferCache(gl);
		this.materialColor = new Float32Array(4);
		this.programState = null;
	}

	render(scene, camera, clearColor) {
		clear(this.gl, clearColor);
		const meshes = collectBootstrapMeshes(scene);
		this.beginStats(meshes.length);
		if (!meshes.length || !camera) return;
		this.programState ||= createBootstrapColorProgram(this.gl);
		scene.updateWorldMatrix?.();
		const { locations, program } = this.programState;
		this.gl.useProgram(program);
		this.gl.uniformMatrix4fv(locations.projectionView, false, cameraProjectionView(camera));
		this.gl.enableVertexAttribArray(locations.position);
		for (const mesh of meshes) this.drawMesh(mesh, locations);
	}

	drawMesh(mesh, locations) {
		const entry = this.buffers.resolve(mesh.geometry);
		if (!entry) return;
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
		gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
		this.buffers.bindColor(entry, locations.vertexColor, locations.position);
		gl.uniformMatrix4fv(locations.model, false, mesh.matrixWorld);
		gl.uniform4fv(locations.color, writeMaterialColor(mesh.material, this.materialColor));
		if (entry.indexBuffer) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
			gl.drawElements(gl.TRIANGLES, entry.count, entry.indexType, 0);
		} else {
			gl.drawArrays(gl.TRIANGLES, 0, entry.count);
		}
		this.stats.draws += 1;
		this.stats.triangles += Math.floor(entry.count / 3);
	}

	beginStats(meshCount) {
		this.stats.frames += 1;
		this.stats.draws = 0;
		this.stats.triangles = 0;
		this.stats.meshes = meshCount;
	}

	dispose() {
		if (this.programState?.program) this.gl.deleteProgram(this.programState.program);
		this.programState = null;
	}
}

function collectBootstrapMeshes(scene) {
	const meshes = [];
	scene?.traverse?.(object => {
		const isMesh = object.isMesh || object.isSkinnedMesh;
		if (isMesh && object.visible !== false && object.userData?.bootstrapVisual) meshes.push(object);
	});
	return meshes;
}

function writeMaterialColor(materialValue, target) {
	const material = Array.isArray(materialValue) ? materialValue[0] : materialValue;
	const value = material?.color || material?.baseColorFactor || DEFAULT_COLOR;
	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		target[0] = value[0] ?? 0.72;
		target[1] = value[1] ?? 0.72;
		target[2] = value[2] ?? 0.72;
		target[3] = value[3] ?? 1;
		return target;
	}
	if (Number.isFinite(value?.r)) {
		target[0] = value.r;
		target[1] = value.g;
		target[2] = value.b;
		target[3] = value.a ?? 1;
		return target;
	}
	target.set(DEFAULT_COLOR);
	return target;
}

function cameraProjectionView(camera) {
	return multiply(
		perspective(camera.fov, camera.aspect, camera.near, camera.far),
		lookAt(camera.position.toArray(), camera.target || [0, 1, 0])
	);
}

function clear(gl, color) {
	gl.clearColor(color[0], color[1], color[2], color[3]);
	gl.clearDepth(1);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
