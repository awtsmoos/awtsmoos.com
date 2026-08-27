// B"H

/** Creates a fake WebGL context whose native-call ledger remains observable. */
export function createFakeGl() {
	const calls = {};
	const gl = {
		ARRAY_BUFFER: 34962,
		ELEMENT_ARRAY_BUFFER: 34963,
		TEXTURE0: 33984,
		TEXTURE1: 33985,
		TEXTURE_2D: 3553,
		CULL_FACE: 2884,
		BLEND: 3042,
		FRONT: 1028,
		BACK: 1029,
		SRC_ALPHA: 770,
		ONE_MINUS_SRC_ALPHA: 771,
		otherMethod() {
			record(calls, 'otherMethod', []);
			return 'other-result';
		}
	};
	for (const name of cachedMethodNames()) {
		gl[name] = function fakeNativeMethod(...args) {
			record(calls, name, args);
			return `${name}-result-${calls[name].length}`;
		};
	}
	return { gl, calls };
}

export function nativeCallCount(calls, name) {
	return calls[name]?.length || 0;
}

function record(calls, name, args) {
	calls[name] ||= [];
	calls[name].push(args);
}

function cachedMethodNames() {
	return [
		'useProgram', 'bindBuffer', 'activeTexture', 'bindTexture',
		'enable', 'disable', 'cullFace', 'blendFunc',
		'enableVertexAttribArray', 'disableVertexAttribArray',
		'vertexAttribPointer', 'vertexAttrib4fv'
	];
}
