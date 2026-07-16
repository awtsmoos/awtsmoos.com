// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-skin.js
 * @description Uploads one exact joint palette after vertex state is already resident.
 * The Awtsmoos moves every limb from one living whole; Awtsmoos.com keeps the palette
 * contract explicit while immutable joint and weight attributes rest inside their VAO.
 */

export function bindSkin(renderer, locations, mesh) {
	const skeleton = mesh.skeleton;
	const uploadedJoints = skeleton.updateCached(
		mesh.matrixWorld || renderer.identityMatrix,
		renderer.frameToken
	);
	recordPaletteWork(renderer, skeleton);
	renderer.stats.skinnedMeshes += 1;
	renderer.stats.jointsUploaded += uploadedJoints;
	renderer.stats.skinGpuUploads += 1;
	uploadJoints(renderer, skeleton, locations);
}

function recordPaletteWork(renderer, skeleton) {
	const metric = skeleton.lastPaletteRecomputed
		? 'skinPaletteRecomputes'
		: 'skinPaletteReuses';
	renderer.stats[metric] += 1;
}

function uploadJoints(renderer, skeleton, locations) {
	if (renderer.jointMode === 'texture') {
		uploadJointTexture(renderer, skeleton, locations);
		return;
	}
	uploadJointUniforms(renderer, skeleton, locations);
}

function uploadJointTexture(renderer, skeleton, locations) {
	const gl = renderer.gl;
	const count = Math.max(1, skeleton.jointCount);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, renderer.skinTexture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		4,
		count,
		0,
		gl.RGBA,
		gl.FLOAT,
		skeleton.jointMatrices
	);
	gl.uniform1i(locations.jointTexture, 0);
	gl.uniform1f(locations.jointTextureHeight, count);
	renderer.stats.skinTextureUploads += 1;
}

function uploadJointUniforms(renderer, skeleton, locations) {
	const gl = renderer.gl;
	const count = Math.min(
		skeleton.jointCount,
		renderer.maxUniformJoints
	);
	if (skeleton.jointCount > renderer.maxUniformJoints) {
		renderer.errors.push(
			`Joint uniform overflow: ${skeleton.jointCount} > ${renderer.maxUniformJoints}`
		);
	}
	gl.uniformMatrix4fv(
		locations.jointMatrices,
		false,
		skeleton.jointMatrices.subarray(0, count * 16)
	);
	renderer.stats.skinUniformUploads += 1;
}
