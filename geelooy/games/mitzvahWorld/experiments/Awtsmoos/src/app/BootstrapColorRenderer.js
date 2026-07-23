// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorRenderer.js
 * @description Draws the bounded first valley with one program and cached shared geometry.
 * The Awtsmoos reveals earth, path, ridge, summit, and traveler through a single beam;
 * Awtsmoos.com traverses only bootstrap meshes and records honest draw and triangle evidence.
 */

import { lookAt, perspective } from '../../../light-three-gltf/tiny-camera-math.js';
import { multiply } from '../../../light-three-gltf/tiny-matrix-core.js';
import { createBootstrapColorProgram } from './BootstrapColorProgram.js';
import { BootstrapMeshBufferCache } from './BootstrapMeshBufferCache.js';

export class BootstrapColorRenderer {
	constructor(gl, stats) {
		this.gl = gl;
		this.stats = stats;
		this.buffers = new BootstrapMeshBufferCache(gl);
		this.programState = null;
	}

	render(scene, camera, clearColor) {
		const gl = this.gl;
		clear(gl, clearColor);
		const meshes = collectBootstrapMeshes(scene);
		this.stats.frames += 1;
		this.stats.draws = 0;
		this.stats.triangles = 0;
		this.stats.meshes = meshes.length;
		if (!meshes.length || !camera) return;
		this.programState ||= createBootstrapColorProgram(gl);
		scene.updateWorldMatrix?.();
		const projectionView = cameraProjectionView(camera);
		const { locations, program } = this.programState;
		gl.useProgram(program);
		gl.uniformMatrix4fv(locations.projectionView, false, projectionView);
		gl.enableVertexAttribArray(locations.position);
		for (const mesh of meshes) this.drawMesh(mesh, locations);
	}

	drawMesh(mesh, locations) {
		const gl = this.gl;
		const entry = this.buffers.resolve(mesh.geometry);
		if (!entry) return;
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
		gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(locations.model, false, mesh.matrixWorld);
		gl.uniform4fv(locations.color, mesh.material?.color || [0.8, 0.8, 0.8, 1]);
		if (entry.indexBuffer) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, entry.indexBuffer);
			gl.drawElements(gl.TRIANGLES, entry.count, entry.indexType, 0);
		} else {
			gl.drawArrays(gl.TRIANGLES, 0, entry.count);
		}
		this.stats.draws += 1;
		this.stats.triangles += Math.floor(entry.count / 3);
	}

	dispose() {
		if (this.programState?.program) this.gl.deleteProgram(this.programState.program);
		this.programState = null;
	}
}

function collectBootstrapMeshes(scene) {
	const meshes = [];
	scene?.traverse?.(object => {
		if (object.isMesh && object.visible !== false && object.userData?.bootstrapVisual) {
			meshes.push(object);
		}
	});
	return meshes;
}

function cameraProjectionView(camera) {
	const eye = camera.position.toArray();
	const target = camera.target || [0, 1, 0];
	return multiply(
		perspective(camera.fov, camera.aspect, camera.near, camera.far),
		lookAt(eye, target)
	);
}

function clear(gl, color) {
	gl.clearColor(color[0], color[1], color[2], color[3]);
	gl.clearDepth(1);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
