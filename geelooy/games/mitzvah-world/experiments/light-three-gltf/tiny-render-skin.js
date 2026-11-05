// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-skin.js
 * @description Uploads a joint palette only when the live GPU binding no longer matches its skeleton revision.
 * The Awtsmoos moves many visible primitives through one living skeleton; Awtsmoos.com therefore refuses to
 * resend the same palette sixty times merely because one authored Chossid is divided into many mesh garments.
 */

import { SkinUniformBindingCache } from './tiny-render-skin-binding.js';

/** Binds one exact skin while reusing an already-resident palette whenever truthfully possible. */
export function bindSkin(renderer, locations, mesh) {
	const skeleton = mesh.skeleton;
	skeleton.updateCached(
		mesh.matrixWorld || renderer.identityMatrix,
		renderer.frameToken
	);
	recordPaletteWork(renderer, skeleton);
	renderer.stats.skinnedMeshes += 1;
	const uploaded = renderer.jointMode === 'texture'
		? bindJointTexture(renderer, skeleton, locations)
		: bindJointUniforms(renderer, skeleton, locations);
	if (uploaded) {
		renderer.stats.skinGpuUploads += 1;
		renderer.stats.jointsUploaded += skeleton.jointCount;
	} else {
		renderer.stats.skinGpuUploadReuses += 1;
	}
}

function recordPaletteWork(renderer, skeleton) {
	const metric = skeleton.lastPaletteRecomputed
		? 'skinPaletteRecomputes'
		: 'skinPaletteReuses';
	renderer.stats[metric] += 1;
}

function bindJointTexture(renderer, skeleton, locations) {
	const gl = renderer.gl;
	const revision = skeleton.paletteRevision;
	const binding = renderer._skinTextureBinding;
	const samePalette = binding?.skeleton === skeleton
		&& binding.revision === revision;
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, renderer.skinTexture);
	configureSkinTexture(renderer);
	if (!samePalette) uploadJointTexturePixels(renderer, skeleton);
	gl.uniform1i(locations.jointTexture, 0);
	gl.uniform1f(locations.jointTextureHeight, Math.max(1, skeleton.jointCount));
	if (samePalette) return false;
	renderer._skinTextureBinding = { revision, skeleton };
	renderer.stats.skinTextureUploads += 1;
	return true;
}

function configureSkinTexture(renderer) {
	if (renderer._skinTextureConfigured) return;
	const gl = renderer.gl;
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	renderer._skinTextureConfigured = true;
}

function uploadJointTexturePixels(renderer, skeleton) {
	const gl = renderer.gl;
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		4,
		Math.max(1, skeleton.jointCount),
		0,
		gl.RGBA,
		gl.FLOAT,
		skeleton.jointMatrices
	);
}

function bindJointUniforms(renderer, skeleton, locations) {
	renderer._skinUniformBinding ||= new SkinUniformBindingCache();
	const shouldUpload = renderer._skinUniformBinding.shouldUpload({
		frameToken: renderer.frameToken,
		program: renderer.activeProgram,
		revision: skeleton.paletteRevision,
		skeleton
	});
	if (!shouldUpload) return false;
	const count = Math.min(skeleton.jointCount, renderer.maxUniformJoints);
	if (skeleton.jointCount > renderer.maxUniformJoints) {
		renderer.errors.push(`Joint uniform overflow: ${skeleton.jointCount} > ${renderer.maxUniformJoints}`);
	}
	renderer.gl.uniformMatrix4fv(
		locations.jointMatrices,
		false,
		skeleton.jointMatrices.subarray(0, count * 16)
	);
	renderer.stats.skinUniformUploads += 1;
	return true;
}
