// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-manual-attributes.js
 * @description Preserves exact manual binding for present and optional ecological attributes.
 * The Awtsmoos is present in extension and fallback alike; Awtsmoos.com carries terrain
 * meaning where declared while historic meshes and locations remain complete without it.
 */

import { ATTRIBUTE_FALLBACKS } from './tiny-render-attribute-fallbacks.js';
import { attributeType } from './tiny-render-webgl-utils.js';

const ATTRIBUTE_NAMES = ['position', 'normal', 'color', 'uv', 'zone'];

export class RenderManualAttributes {
	constructor(gl) {
		this.gl = gl;
		this.stats = null;
		this.invalidate();
	}

	beginFrame(stats) {
		this.stats = stats;
		stats.manualAttributeBindings = 0;
	}

	invalidate() {
		this.arrayBuffer = null;
		this.elementBuffer = null;
		this.attributes = new Map();
	}

	bind(resource, locations, skinned) {
		for (const name of ATTRIBUTE_NAMES) {
			this.bindNamed(name, resource, locations);
		}
		this.bindNamed('joints', resource, locations, skinned);
		this.bindNamed('weights', resource, locations, skinned);
		this.bindElement(resource.index);
		if (this.stats) this.stats.manualAttributeBindings += 1;
	}

	bindNamed(name, resource, locations, enabled = true) {
		const location = locations[name];
		if (!Number.isInteger(location) || location < 0) return;
		const entry = enabled ? resource.attributes[name] : null;
		if (!entry) {
			this.bindFallback(location, ATTRIBUTE_FALLBACKS[name]);
			return;
		}
		const signature = [
			entry.buffer,
			entry.attribute.itemSize,
			attributeType(this.gl, entry.attribute),
			Boolean(entry.attribute.normalized)
		];
		if (sameAttribute(this.attributes.get(location), signature)) {
			this.recordSkip();
			return;
		}
		this.bindArray(entry.buffer);
		this.gl.enableVertexAttribArray(location);
		this.gl.vertexAttribPointer(location, signature[1], signature[2], signature[3], 0, 0);
		this.attributes.set(location, signature);
		this.recordUpload();
	}

	bindFallback(location, values) {
		const signature = ['fallback', ...values];
		if (sameAttribute(this.attributes.get(location), signature)) {
			this.recordSkip();
			return;
		}
		this.gl.disableVertexAttribArray(location);
		this.gl.vertexAttrib4fv(location, values);
		this.attributes.set(location, signature);
		this.recordUpload();
	}

	bindArray(buffer) {
		if (this.arrayBuffer === buffer) return;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.arrayBuffer = buffer;
	}

	bindElement(buffer) {
		if (this.elementBuffer === buffer) {
			this.recordSkip();
			return;
		}
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
		this.elementBuffer = buffer;
		this.recordUpload();
	}

	recordSkip() {
		if (this.stats) this.stats.bufferStateSkips += 1;
	}

	recordUpload() {
		if (this.stats) this.stats.bufferStateUploads += 1;
	}
}

function sameAttribute(left, right) {
	return Boolean(left)
		&& left.length === right.length
		&& left.every((value, index) => value === right[index]);
}
