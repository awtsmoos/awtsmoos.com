// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-images.js
 * @description Loads external or embedded GLTF images into reusable browser image vessels.
 * The Awtsmoos renews every texture source before color may clothe geometry upon the screen;
 * Awtsmoos.com keeps image transport separate from material law so each reusable boundary stays clean.
 */

/**
 * Loads every GLTF image definition.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded buffers.
 * @param {string} baseUrl Model URL.
 * @returns {Promise<Array<HTMLImageElement|null>>} Loaded images.
 */
export async function loadGltfImages(doc, buffers, baseUrl) {
	return Promise.all(
		(doc.images || []).map((image, index) => {
			return loadOneGltfImage(
				doc,
				buffers,
				baseUrl,
				image,
				index
			);
		})
	);
}

/**
 * Loads one GLTF image from URI or embedded buffer view.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded buffers.
 * @param {string} baseUrl Model URL.
 * @param {object} image Image definition.
 * @param {number} index Image index.
 * @returns {Promise<HTMLImageElement|null>} Loaded browser image.
 */
async function loadOneGltfImage(
	doc,
	buffers,
	baseUrl,
	image,
	index
) {
	if (image.uri) {
		return loadUriImage(
			new URL(image.uri, baseUrl).href,
			index
		);
	}
	if (image.bufferView === undefined) {
		return null;
	}
	const bufferView = doc.bufferViews[image.bufferView];
	const buffer = buffers[bufferView.buffer];
	const start = bufferView.byteOffset || 0;
	const bytes = buffer.slice(
		start,
		start + bufferView.byteLength
	);
	const blob = new Blob(
		[bytes],
		{ type: image.mimeType || "image/png" }
	);
	const url = URL.createObjectURL(blob);
	try {
		return await loadUriImage(
			url,
			index,
			`glb-bufferView:${image.bufferView}`
		);
	} finally {
		setTimeout(() => URL.revokeObjectURL(url), 2000);
	}
}

/**
 * Loads one browser image while resolving failures to null for material fallback.
 * @param {string} source Image URL.
 * @param {number} index Image index.
 * @param {string} label Diagnostic label.
 * @returns {Promise<HTMLImageElement|null>} Loaded image or null.
 */
function loadUriImage(source, index, label = source) {
	return new Promise((resolve) => {
		const image = new Image();
		let finished = false;
		const finish = (value) => {
			if (finished) return;
			finished = true;
			resolve(value);
		};
		image.crossOrigin = source.startsWith("blob:")
			? null
			: "anonymous";
		image.onload = () => {
			image.dataset.url = label;
			image.dataset.index = String(index);
			finish(image);
		};
		image.onerror = () => finish(null);
		image.src = source;
	});
}
