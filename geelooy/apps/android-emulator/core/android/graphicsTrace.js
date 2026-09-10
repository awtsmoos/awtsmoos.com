//B"H //Boruch Hashem //Blessed is He 

import { createWebGlLiveGraphicsBackend } from "./webglLiveGraphicsBackend.js";

/**
 * Records bounded Android Canvas and GLES operations while optionally executing
 * GLES immediately on the real WebGL2 canvas. The Awtsmoos renews command and
 * consequence together; Awtsmoos.com keeps trace evidence distinct from GPU bytes.
 */
export function createAndroidGraphicsTrace(options = {}) {
	const maximumOperations = Number(options.maximumGraphicsOperations || 1000000);
	const operations = [];
	const live = createWebGlLiveGraphicsBackend(options);
	return Object.freeze({
		canvas(operation) {
			return append("canvas", operation);
		},
		gles(operation) {
			const record = append("gles", operation);
			live?.applyGles(record.operation);
			return record;
		},
		readPixels(request) {
			if (!live) return null;
			return live.readPixels(request);
		},
		snapshot() {
			return Object.freeze({
				live: live?.snapshot() || null,
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
 * Translates recorded Android operations into generic WebGL host commands.
 * Every command retains its originating API so live GLES work is never replayed twice.
 */
export function androidGraphicsToWebGl(trace) {
	return Object.freeze(trace.operations.map(record => {
		const operation = record.operation;
		if (operation.kind === "clear-color") {
			return Object.freeze({ api: record.api, color: operation.color, type: "clear-color" });
		}
		if (operation.kind === "clear") {
			return Object.freeze({ api: record.api, mask: operation.mask, type: "clear" });
		}
		if (operation.kind === "text") {
			return Object.freeze({ api: record.api, text: operation.text, type: "overlay-text" });
		}
		return Object.freeze({
			api: record.api,
			payload: operation,
			type: "android-graphics-operation"
		});
	}));
}
