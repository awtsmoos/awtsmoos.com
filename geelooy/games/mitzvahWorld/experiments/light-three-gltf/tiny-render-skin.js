// B"H
/** Uploads skin attributes and joint transforms for one skinned draw. */
export function bindSkin(renderer, locations, mesh, buffers) {
	renderer.buffers.bindAttribute(
		locations.joints,
		buffers.jointsAttribute,
		buffers.joints,
		[0, 0, 0, 0]
	);
	renderer.buffers.bindAttribute(
		locations.weights,
		buffers.weightsAttribute,
		buffers.weights,
		[1, 0, 0, 0]
	);
	const uploaded = mesh.skeleton.update(
		mesh.matrixWorld || renderer.identityMatrix,
		renderer.worldByNode || new Map()
	);
	renderer.stats.skinnedMeshes += 1;
	renderer.stats.jointsUploaded += uploaded;
	uploadJoints(renderer, mesh.skeleton, locations);
}

function uploadJoints(renderer, skeleton, locations) {
	const gl = renderer.gl;
	const count = skeleton.jointCount;
	if (renderer.jointMode === 'texture') {
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
			Math.max(1, count),
			0,
			gl.RGBA,
			gl.FLOAT,
			skeleton.jointMatrices
		);
		gl.uniform1i(locations.jointTexture, 0);
		gl.uniform1f(locations.jointTextureHeight, Math.max(1, count));
		return;
	}
	if (count > renderer.maxUniformJoints) {
		renderer.errors.push(`Joint uniform overflow: ${count} > ${renderer.maxUniformJoints}`);
	}
	gl.uniformMatrix4fv(
		locations.jointMatrices,
		false,
		skeleton.jointMatrices.subarray(0, Math.min(count, renderer.maxUniformJoints) * 16)
	);
}
