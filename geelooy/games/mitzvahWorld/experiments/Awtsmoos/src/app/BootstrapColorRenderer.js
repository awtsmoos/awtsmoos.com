// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorRenderer.js
 * @description Draws meadow and GLB player meshes through one tiny color program.
 * The Awtsmoos reveals many finite garments through one beam; Awtsmoos.com accepts simple colors,
 * GLTF factors, indexed geometry, and static skinned bind poses without importing a rich renderer.
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

		if (!meshes.length || !camera) {
			return;
		}

		this.programState ||= createBootstrapColorProgram(gl);
		scene.updateWorldMatrix?.();

		const projectionView = cameraProjectionView(camera);
		const { locations, program } = this.programState;

		gl.useProgram(program);
		gl.uniformMatrix4fv(
			locations.projectionView,
			false,
			projectionView
		);
		gl.enableVertexAttribArray(locations.position);

		for (const mesh of meshes) {
			this.drawMesh(mesh, locations);
		}
	}

	drawMesh(mesh, locations) {
		const gl = this.gl;
		const entry = this.buffers.resolve(mesh.geometry);

		if (!entry) {
			return;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, entry.positionBuffer);
		gl.vertexAttribPointer(
			locations.position,
			3,
			gl.FLOAT,
			false,
			0,
			0
		);
		gl.uniformMatrix4fv(
			locations.model,
			false,
			mesh.matrixWorld
		);
		gl.uniform4fv(
			locations.color,
			materialColor(mesh.material)
		);

		if (entry.indexBuffer) {
			gl.bindBuffer(
				gl.ELEMENT_ARRAY_BUFFER,
				entry.indexBuffer
			);
			gl.drawElements(
				gl.TRIANGLES,
				entry.count,
				entry.indexType,
				0
			);
		} else {
			gl.drawArrays(
				gl.TRIANGLES,
				0,
				entry.count
			);
		}

		this.stats.draws += 1;
		this.stats.triangles += Math.floor(entry.count / 3);
	}

	dispose() {
		if (this.programState?.program) {
			this.gl.deleteProgram(this.programState.program);
		}

		this.programState = null;
	}
}

function collectBootstrapMeshes(scene) {
	const meshes = [];

	scene?.traverse?.((object) => {
		const isMesh = object.isMesh || object.isSkinnedMesh;
		const isVisible = object.visible !== false;
		const isBootstrapVisual = object.userData?.bootstrapVisual;

		if (isMesh && isVisible && isBootstrapVisual) {
			meshes.push(object);
		}
	});

	return meshes;
}

function materialColor(materialValue) {
	const material = Array.isArray(materialValue) ?
		materialValue[0] :
		materialValue;
	const value = material?.color ||
		material?.baseColorFactor ||
		DEFAULT_COLOR;

	if (Array.isArray(value) || ArrayBuffer.isView(value)) {
		return [
			value[0] ?? 0.72,
			value[1] ?? 0.72,
			value[2] ?? 0.72,
			value[3] ?? 1
		];
	}

	if (Number.isFinite(value?.r)) {
		return [
			value.r,
			value.g,
			value.b,
			value.a ?? 1
		];
	}

	return DEFAULT_COLOR;
}

function cameraProjectionView(camera) {
	return multiply(
		perspective(
			camera.fov,
			camera.aspect,
			camera.near,
			camera.far
		),
		lookAt(
			camera.position.toArray(),
			camera.target || [0, 1, 0]
		)
	);
}

function clear(gl, color) {
	gl.clearColor(
		color[0],
		color[1],
		color[2],
		color[3]
	);
	gl.clearDepth(1);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
