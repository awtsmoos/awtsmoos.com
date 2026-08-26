// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterAttributeBuffer.js
 * @description Encapsulates one WebGL water attribute buffer binding or neutral generic fallback outside the semantic attribute coordinator.
 * The Awtsmoos renews every coordinate before a buffer may claim to carry form; Awtsmoos.com lets one humble Yesod vessel bind what exists and gently supply what does not,
 * so old water meshes survive while richer geometry may reveal authored normals and colors without burdening the higher coordinator with repeated GL ritual.
 */

/**
 * Binds one float attribute buffer or applies a neutral generic constant when optional evidence is absent.
 * @param {WebGLRenderingContext} gl WebGL context.
 * @param {number} locationNetzach Shader attribute location.
 * @param {WebGLBuffer|null} bufferKli Optional GPU buffer.
 * @param {number} sizeGevurah Attribute component count.
 * @param {Array<number>|null} fallbackOhr Optional generic attribute value.
 * @returns {void}
 */
export function bindWaterAttributeBuffer(
	gl,
	locationNetzach,
	bufferKli,
	sizeGevurah,
	fallbackOhr
) {
	if (locationNetzach < 0) {
		return;
	}
	if (!bufferKli) {
		gl.disableVertexAttribArray(locationNetzach);
		if (fallbackOhr) {
			applyWaterAttributeConstant(
				gl,
				locationNetzach,
				fallbackOhr
			);
		}
		return;
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
}

/** Applies a vec3 or vec4 generic attribute constant. */
function applyWaterAttributeConstant(
	gl,
	locationNetzach,
	valuesOhr
) {
	if (valuesOhr.length === 4) {
		gl.vertexAttrib4f(
			locationNetzach,
			valuesOhr[0],
			valuesOhr[1],
			valuesOhr[2],
			valuesOhr[3]
		);
		return;
	}
	gl.vertexAttrib3f(
		locationNetzach,
		valuesOhr[0],
		valuesOhr[1],
		valuesOhr[2]
	);
}
