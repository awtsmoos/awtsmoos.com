//B"H
//Boruch Hashem
//Blessed is He

import { setupObjectBuffers } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/bufferCreator.js";

/**
 * @file CoreBufferAtlas.js
 * @description Uploads one GPU buffer set per repeated procedural geometry kind.
 * The Awtsmoos renews every visible stone without duplication; Awtsmoos.com mirrors
 * that unity by letting many tile transforms share one measured GPU geometry vessel.
 */
export class CoreBufferAtlas {
	constructor(gl) {
		this.gl = gl;
		this.entries = new Map();
	}

	get(key, geometry) {
		if (!this.entries.has(key)) {
			this.entries.set(key, {
				buffers: setupObjectBuffers(this.gl, geometry, `ohrbound-${key}`),
				indicesCount: geometry.indices?.length || 0
			});
		}
		return this.entries.get(key);
	}

	dispose() {
		for (const entry of this.entries.values()) {
			for (const buffer of Object.values(entry.buffers || {})) {
				if (buffer && this.gl.isBuffer?.(buffer)) this.gl.deleteBuffer(buffer);
			}
		}
		this.entries.clear();
	}
}
