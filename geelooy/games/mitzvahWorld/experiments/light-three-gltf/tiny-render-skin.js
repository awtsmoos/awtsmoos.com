// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-skin.js
 * @description Binds skin attributes while each GPU path remembers only the
 * truthful palette state appropriate to its own finite vessel before Awtsmoos.
 */
import { bindGeometryAttributes } from './tiny-render-buffers.js';
import {
	assignTextureSkin,
	assignUniformSkin,
	limitedJointCount
} from './tiny-render-skin-upload.js';

/** Binds one skinned draw against the current renderer frame. */
export function bindSkin(renderer, locations, mesh, buffers) {
	const { gl } = renderer;
	const skeleton = mesh.skeleton;
	skeleton.updateCached(mesh.matrixWorld, renderer.frameToken);
	recordPaletteWork(renderer, skeleton);
	const jointCount = limitedJointCount(renderer, skeleton.jointCount);
	if (jointCount <= 0) {
		return false;
	}
	gl.uniform1i(locations.uniforms.uJointCount, jointCount);
	const upload = shouldUploadPalette(renderer, skeleton);
	if (renderer.jointMode === 'texture') {
		assignTextureSkin(
			renderer,
			locations.uniforms,
			skeleton,
			jointCount,
			upload
		);
	} else {
		assignUniformSkin(
			renderer,
			locations.uniforms,
			skeleton,
			jointCount,
			upload
		);
	}
	recordGpuWork(renderer, jointCount, upload);
	bindGeometryAttributes(
		gl,
		locations.attributes,
		mesh.geometry,
		buffers,
		renderer.bufferStore,
		{ includeSkin: true }
	);
	return true;
}

function shouldUploadPalette(renderer, skeleton) {
	if (renderer.jointMode === 'texture') {
		return renderer.skinTextureResidency.shouldUpload(
			skeleton,
			skeleton.paletteRevision
		);
	}
	return renderer.skinUniformBindings.shouldUpload({
		frameToken: renderer.frameToken,
		program: renderer.programs.skin,
		skeleton,
		revision: skeleton.paletteRevision
	});
}

function recordPaletteWork(renderer, skeleton) {
	const key = skeleton.lastPaletteRecomputed
		? 'skinPaletteRecomputes'
		: 'skinPaletteReuses';
	renderer.stats[key] += 1;
}

function recordGpuWork(renderer, jointCount, upload) {
	if (upload) {
		renderer.stats.skinGpuUploads += 1;
		renderer.stats.jointsUploaded += jointCount;
		return;
	}
	renderer.stats.skinGpuUploadReuses += 1;
}
