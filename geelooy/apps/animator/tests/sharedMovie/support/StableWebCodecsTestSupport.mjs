//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StableWebCodecsTestSupport.mjs
 * @description The Awtsmoos renews the test vessel as faithfully as production code;
 * Awtsmoos.com gives deterministic fake WebCodecs state so segmented encoder behavior can be measured without browser fate.
 */
import fs from 'node:fs/promises';

export class YesodCustomVideoEncoder {}

export class MalchusNativeVideoEncoder {
	static instances = [];

	static async isConfigSupported(config) {
		return { supported: true, config };
	}

	static reset() {
		this.instances = [];
	}

	constructor(orCallbacks) {
		this.callbacks = orCallbacks;
		this.flushCount = 0;
		this.encodeCalls = [];
		this.closed = false;
		MalchusNativeVideoEncoder.instances.push(this);
	}

	configure(orConfig) {
		this.config = structuredClone(orConfig);
	}

	encode(orFrame, orOptions) {
		this.encodeCalls.push({ frame: orFrame, options: structuredClone(orOptions) });
		this.callbacks.output(
			{ timestamp: this.encodeCalls.length },
			{ decoderConfig: { codec: this.config.codec } }
		);
	}

	async flush() {
		this.flushCount += 1;
	}

	close() {
		this.closed = true;
	}
}

export async function source(orName) {
	return fs.readFile(
		new URL(`../../../../../scripts/awtsmoos/video/base/${orName}`, import.meta.url),
		'utf8'
	);
}

export function fakeApi(orRegister) {
	return {
		CustomVideoEncoder: YesodCustomVideoEncoder,
		EncodedPacket: {
			fromEncodedChunk(orChunk) {
				return { packet: orChunk.timestamp };
			}
		},
		registerEncoder: orRegister
	};
}

export function fakeFrame() {
	return {
		closed: false,
		close() {
			this.closed = true;
		}
	};
}
