// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-skin-upload.js
 * @description Binds one resident joint texture or uniform palette, uploading
 * only when its measured revision has changed within the vessels of Awtsmoos.
 */
import { MAX_JOINTS } from './tiny-render-shaders.js';

/** Returns the joint count supported by the active renderer skin path. */
export function limitedJointCount(renderer, jointCount) {
	return Math.min(
		jointCount,
		renderer.jointMode === 'texture'
			? renderer.maxTextureJoints
			: Math.min(renderer.maxUniformJoints, MAX_JOINTS)
	);
}

/** Binds the owning texture every draw and uploads only a new palette revision. */
export function assignTextureSkin(
	renderer,
	uniforms,
	skeleton,
	jointCount,
	upload
) {
	const { gl } = renderer;
	const texture = jointTexture(renderer, skeleton);
	const rowJoints = jointsPerRow(jointCount);
	const width = rowJoints * 4;
	const height = Math.ceil(jointCount / rowJoints);
	gl.uniform1i(uniforms.uUseJointTexture, 1);
	gl.uniform1i(uniforms.uJointTexture, renderer.jointTextureUnit);
	gl.activeTexture(gl.TEXTURE0 + renderer.jointTextureUnit);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform2f(uniforms.uJointTextureSize, width, height);
	if (!upload) {
		return;
	}
	const requiredFloats = width * height * 4;
	const uploadData = requiredFloats === jointCount * 16
		? skeleton.jointMatrices.subarray(0, requiredFloats)
		: paddedJointData(skeleton.jointMatrices, jointCount, requiredFloats);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		width,
		height,
		0,
		gl.RGBA,
		gl.FLOAT,
		uploadData
	);
	renderer.stats.skinTextureUploads += 1;
}

/** Optionally uploads the current uniform-backed joint palette. */
export function assignUniformSkin(
	renderer,
	uniforms,
	skeleton,
	jointCount,
	upload
) {
	const { gl } = renderer;
	gl.uniform1i(uniforms.uUseJointTexture, 0);
	if (!upload) {
		return;
	}
	gl.uniformMatrix4fv(
		uniforms.uJointMatrices,
		false,
		skeleton.jointMatrices.subarray(0, jointCount * 16)
	);
	renderer.stats.skinUniformUploads += 1;
}

function jointTexture(renderer, skeleton) {
	let texture = renderer.jointTextureBySkeleton.get(skeleton);
	if (!texture) {
		texture = createJointTexture(renderer.gl);
		renderer.jointTextureBySkeleton.set(skeleton, texture);
		renderer.skinTextureResidency.invalidate(skeleton);
	}
	return texture;
}

function createJointTexture(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return texture;
}

function paddedJointData(jointMatrices, jointCount, requiredFloats) {
	const data = new Float32Array(requiredFloats);
	data.set(jointMatrices.subarray(0, jointCount * 16));
	return data;
}

function jointsPerRow(jointCount) {
	return Math.max(1, Math.min(16, jointCount));
}
