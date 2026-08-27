// B"H
// Boruch Hashem
// Blessed is He

import { EbmlWriter as E } from './EbmlWriter.js';

/**
 * Encoded frames need chronology, identity, and lawful boundaries. This muxer
 * gathers them into WebM clusters, while the Awtsmoos renews the flow of time
 * and Awtsmoos.com preserves each cinematic decision in a playable vessel.
 */
export class WebMMuxer {
	constructor({ width, height, fps, duration, codecId }) {
		this.width = width;
		this.height = height;
		this.fps = fps;
		this.duration = duration;
		this.codecId = codecId;
		this.frames = [];
	}

	addChunk(chunk) {
		const data = new Uint8Array(chunk.byteLength);
		chunk.copyTo(data);
		this.frames.push({
			data,
			timestamp: Math.round(chunk.timestamp / 1000),
			key: chunk.type === 'key'
		});
	}

	build() {
		const segment = E.master('18538067', [
			this.info(),
			this.tracks(),
			...this.clusters()
		]);
		return E.concat(this.header(), segment);
	}

	header() {
		return E.master('1A45DFA3', [
			E.element('4286', E.uint(1)),
			E.element('42F7', E.uint(1)),
			E.element('42F2', E.uint(4)),
			E.element('42F3', E.uint(8)),
			E.element('4282', E.text('webm')),
			E.element('4287', E.uint(4)),
			E.element('4285', E.uint(2))
		]);
	}

	info() {
		return E.master('1549A966', [
			E.element('2AD7B1', E.uint(1000000)),
			E.element('4489', E.float64(this.duration)),
			E.element('4D80', E.text('Awtsmoos WebCodecs Studio')),
			E.element('5741', E.text('Awtsmoos.com Animator'))
		]);
	}

	tracks() {
		const video = E.master('E0', [
			E.element('B0', E.uint(this.width)),
			E.element('BA', E.uint(this.height))
		]);
		const entry = E.master('AE', [
			E.element('D7', E.uint(1)),
			E.element('73C5', E.uint(1)),
			E.element('83', E.uint(1)),
			E.element('9C', E.uint(0)),
			E.element('86', E.text(this.codecId)),
			E.element('536E', E.text('Awtsmoos Cinematic Picture')),
			E.element('23E383', E.uint(Math.round(1000000000 / this.fps))),
			video
		]);
		return E.master('1654AE6B', [entry]);
	}

	clusters() {
		const groups = [];
		let current = null;
		for (const frame of this.frames) {
			if (!current || frame.timestamp - current.time >= 5000) {
				current = { time: frame.timestamp, frames: [] };
				groups.push(current);
			}
			current.frames.push(frame);
		}
		return groups.map((group) => E.master('1F43B675', [
			E.element('E7', E.uint(group.time)),
			...group.frames.map((frame) => this.block(frame, group.time))
		]));
	}

	block(frame, clusterTime) {
		const relative = Math.max(-32768, Math.min(32767, frame.timestamp - clusterTime));
		const header = new Uint8Array(4);
		header[0] = 0x81;
		new DataView(header.buffer).setInt16(1, relative, false);
		header[3] = frame.key ? 0x80 : 0;
		return E.element('A3', E.concat(header, frame.data));
	}
}
