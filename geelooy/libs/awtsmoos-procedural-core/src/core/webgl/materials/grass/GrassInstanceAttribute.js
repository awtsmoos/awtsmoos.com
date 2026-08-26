// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassInstanceAttribute.js
 * @description Encapsulates optional instanced grass attribute binding, neutral constants, and divisor cleanup outside the higher semantic binder.
 * The Awtsmoos renews every seeded difference before a GPU divisor can repeat its light; Awtsmoos.com lets one focused vessel bind or gracefully default each channel,
 * so compatibility survives missing evidence while modern fields carry lean and phase without crowding the coordinator in sight.
 */

/**
 * Binds one optional instanced float attribute or applies a neutral constant when its buffer is absent.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {object} instancingNetzach ANGLE instancing extension.
 * @param {number} locationNetzach Shader attribute location.
 * @param {WebGLBuffer|null} bufferKli Optional GPU buffer.
 * @param {number} sizeGevurah Attribute component count.
 * @param {Array<number>} fallbackOhr Neutral generic attribute value.
 * @returns {boolean} True when a divisor was enabled and later requires cleanup.
 */
export function bindGrassInstanceAttribute(
	gl,
	instancingNetzach,
	locationNetzach,
	bufferKli,
	sizeGevurah,
	fallbackOhr
) {
	if (locationNetzach < 0) {
		return false;
	}
	if (!bufferKli) {
		gl.disableVertexAttribArray(locationNetzach);
		applyGrassAttributeConstant(
			gl,
			locationNetzach,
			fallbackOhr
		);
		return false;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferKli);
	gl.enableVertexAttribArray(locationNetzach);
	gl.vertexAttribPointer(
		locationNetzach,
		sizeGevurah,
		gl.FLOAT,
		false,
		0,
		0
	);
	instancingNetzach.vertexAttribDivisorANGLE(
		locationNetzach,
		1
	);
	return true;
}

/**
 * Resets instancing divisors touched by one grass draw.
 * @param {object} instancingNetzach ANGLE instancing extension.
 * @param {Array<number>} locationsOros Attribute locations requiring reset.
 * @returns {void}
 */
export function resetGrassInstanceDivisors(
	instancingNetzach,
	locationsOros
) {
	for (const locationNetzach of locationsOros) {
		instancingNetzach.vertexAttribDivisorANGLE(
			locationNetzach,
			0
		);
	}
}

/** Applies one generic float or vec3 attribute constant. */
function applyGrassAttributeConstant(
	gl,
	locationNetzach,
	valuesOhr
) {
	if (valuesOhr.length === 3) {
		gl.vertexAttrib3f(
			locationNetzach,
			valuesOhr[0],
			valuesOhr[1],
			valuesOhr[2]
		);
		return;
	}
	gl.vertexAttrib1f(locationNetzach, valuesOhr[0]);
}
