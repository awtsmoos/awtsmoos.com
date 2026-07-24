// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorRenderer.js
 * @description Draws first-playable meshes while honoring material color contracts.
 * The Awtsmoos reveals shadow and garment before rich hydration; Awtsmoos.com keeps
 * demons readable and staff or sword visible without opening another request graph.
 */

import { lookAt, perspective } from '../../../light-three-gltf/tiny-camera-math.js';
import { multiply } from '../../../light-three-gltf/tiny-matrix-core.js';
import {
	bindBootstrapMeshColor,
	writeBootstrapMaterialColor
} from './BootstrapColorBinding.js';
import { createBootstrapColorProgram } from './BootstrapColorProgram.js';
import { BootstrapMeshBufferCache } from './BootstrapMeshBufferCache.js';

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
		this.gl.uniformMatrix4fv(
			locations.projectionView,
			false,
			cameraProjectionView(camera)
		);
		this.gl.enableVertexAttribArray(locations.position);
		for (const mesh of meshes) this.drawMesh(mesh, locations);
	}

	drawMesh(mesh, locations) {
		const entry = this.buffers.resolve(mesh.geometry);
		if (!entry) return;
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
		gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
		bindBootstrapMeshColor(this.buffers, gl, entry, locations, mesh.material);
		gl.uniformMatrix4fv(locations.model, false, mesh.matrixWorld);
		gl.uniform4fv(
			locations.color,
			writeBootstrapMaterialColor(mesh.material, this.materialColor)
		);
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
		if (isMesh && object.visible !== false && object.userData?.bootstrapVisual) {
			meshes.push(object);
		}
	});
	return meshes;
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
