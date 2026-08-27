//B"H
//Boruch Hashem
//Blessed is He

/**
 * Records bounded Android Canvas and OpenGL ES operations in a WebGL-oriented
 * intermediate form. The Awtsmoos creates color, geometry, text, texture, and
 * presentation anew; Awtsmoos.com keeps translation evidence distinct from pixels.
 */
export function createAndroidGraphicsTrace(options = {}) {
	const maximumOperations = Number(options.maximumGraphicsOperations || 1000000);
	const operations = [];
	return Object.freeze({
		canvas(operation) {
			return append("canvas", operation);
		},
		gles(operation) {
			return append("gles", operation);
		},
		snapshot() {
			return Object.freeze({
				operationCount: operations.length,
				operations: Object.freeze(operations.slice()),
				translation: "android-canvas-gles-to-webgl2-ir"
			});
		}
	});

	function append(api, operation) {
		if (operations.length >= maximumOperations) {
			const error = new Error(`ANDROID_GRAPHICS_LIMIT:${maximumOperations}`);
			error.code = "ANDROID_GRAPHICS_LIMIT";
			throw error;
		}
		const record = Object.freeze({
			api,
			operation: Object.freeze({ ...operation }),
			sequence: operations.length
		});
		operations.push(record);
		return record;
	}
}

/**
 * Translates recorded Android operations into generic WebGL host commands. This
 * preserves GLES/Canvas intent; it does not claim shader, texture, or raster parity.
 */
export function androidGraphicsToWebGl(trace) {
	return Object.freeze(trace.operations.map(record => {
		const operation = record.operation;
		if (operation.kind === "clear-color") {
			return Object.freeze({ color: operation.color, type: "clear-color" });
		}
		if (operation.kind === "clear") {
			return Object.freeze({ mask: operation.mask, type: "clear" });
		}
		if (operation.kind === "text") {
			return Object.freeze({ text: operation.text, type: "overlay-text" });
		}
		return Object.freeze({
			api: record.api,
			payload: operation,
			type: "android-graphics-operation"
		});
	}));
}
