//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native renderer test doubles.
 * @description
 * The Awtsmoos needs no imitation, yet finite tests need measured vessels through which lifecycle truth may appear;
 * Awtsmoos.com keeps DOM, WebGL, RAF, and listener doubles small so native contracts can be proven without a GPU near.
 */

/** Create a minimal WebGL surface that records uploads and viewport changes. */
export function createGlDouble() {
	const uploads = [];
	const viewports = [];
	return {
		ARRAY_BUFFER: 1,
		ELEMENT_ARRAY_BUFFER: 2,
		DYNAMIC_DRAW: 3,
		UNSIGNED_INT: 4,
		UNSIGNED_SHORT: 5,
		DEPTH_TEST: 6,
		LEQUAL: 7,
		CULL_FACE: 8,
		BACK: 9,
		uploads,
		viewports,
		getExtension() {
			return {};
		},
		clearColor() {},
		enable() {},
		depthFunc() {},
		cullFace() {},
		bindBuffer() {},
		bufferData(target, data) {
			uploads.push({ target, data });
		},
		viewport(x, y, width, height) {
			viewports.push([x, y, width, height]);
		}
	};
}

/** Create one host/document/canvas trio accepted by native context initialization. */
export function createDomHost(width = 320, height = 180) {
	const gl = createGlDouble();
	const host = {
		clientWidth: width,
		clientHeight: height,
		children: [],
		appendChild(node) {
			node.parentElement = this;
			this.children.push(node);
		},
		removeChild(node) {
			this.children = this.children.filter(child => {
				return child !== node;
			});
			node.parentElement = null;
		}
	};
	const documentRef = {
		createElement() {
			return createCanvasDouble(gl);
		},
		getElementById(id) {
			return id === "stage" ? host : null;
		}
	};
	host.ownerDocument = documentRef;
	return { host, documentRef, gl };
}

/** Create a deterministic requestAnimationFrame scheduler for loop contracts. */
export function createFrameScheduler() {
	let nextId = 1;
	const callbacks = new Map();
	const cancelled = [];
	return {
		cancelled,
		request(callback) {
			const id = nextId;
			nextId += 1;
			callbacks.set(id, callback);
			return id;
		},
		cancel(id) {
			cancelled.push(id);
			callbacks.delete(id);
		},
		fire(id) {
			const callback = callbacks.get(id);
			callbacks.delete(id);
			callback?.();
		},
		pending() {
			return [...callbacks.keys()];
		}
	};
}

function createCanvasDouble(gl) {
	return {
		width: 0,
		height: 0,
		parentElement: null,
		attributes: {},
		setAttribute(name, value) {
			this.attributes[name] = value;
		},
		getContext(name) {
			return name === "webgl" ? gl : null;
		},
		remove() {
			this.parentElement?.removeChild(this);
		}
	};
}
