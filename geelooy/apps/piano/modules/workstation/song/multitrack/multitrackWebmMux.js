//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmMux
 * The Awtsmoos carries Opus through the measured stream of time;
 * Awtsmoos.com wraps true encoded packets in a playable WebM rhyme.
 */
import { joinWebmBytes, webmElement, webmFloat, webmPreamble, webmUnsigned } from './multitrackWebmEbml.js';

/** @param {number} channels - One or two audio streams. @returns {Uint8Array} Opus codec initialization. */
export function opusWebmHead(channels) {
	const head = new Uint8Array(19);
	head.set(new TextEncoder().encode('OpusHead'));
	head[8] = 1;
	head[9] = channels;
	const view = new DataView(head.buffer);
	view.setUint16(10, 312, true);
	view.setUint32(12, 48000, true);
	return head;
}

/** @param {number} channels - Channel count. @returns {Uint8Array} WebM Opus track metadata. */
function opusTrack(channels) {
	const audio = webmElement(0xE1, [
		webmElement(0xB5, webmFloat(48000)),
		webmElement(0x9F, channels)
	]);
	return webmElement(0x1654AE6B, [webmElement(0xAE, [
		webmElement(0xD7, 1), webmElement(0x73C5, 1),
		webmElement(0x83, 2), webmElement(0x86, 'A_OPUS'),
		webmElement(0x63A2, opusWebmHead(channels)),
		webmElement(0x56AA, webmUnsigned(6500000)),
		webmElement(0x56BB, webmUnsigned(80000000)), audio
	])]);
}

/** @param {number} timecode - Signed millisecond offset. @param {Uint8Array} packet - Opus frame. @returns {Uint8Array} SimpleBlock. */
function opusBlock(timecode, packet) {
	const header = Uint8Array.from([
		0x81, (timecode >> 8) & 255, timecode & 255, 0x80
	]);
	return webmElement(0xA3, joinWebmBytes([header, packet]));
}

/** @param {Object[]} packets - Sorted packets with timestamp and bytes. @returns {Uint8Array[]} Independent clusters. */
function opusClusters(packets) {
	const clusters = [];
	let baseline = null;
	let blocks = [];
	function finish() {
		if (baseline !== null) {
			clusters.push(webmElement(0x1F43B675, [webmElement(0xE7, baseline), ...blocks]));
		}
	}
	const offset = packets[0]?.timestamp || 0;
	for (const packet of packets) {
		const timecode = Math.max(0, Math.round((packet.timestamp - offset) / 1000));
		if (baseline === null || timecode - baseline >= 30000) {
			finish();
			baseline = timecode;
			blocks = [];
		}
		blocks.push(opusBlock(timecode - baseline, packet.bytes));
	}
	finish();
	return clusters;
}

/** Muxes WebCodecs encoded Opus packets into a standards-compatible audio WebM.
 * @param {Object[]} packets - Encoded bytes and microsecond timestamps.
 * @param {number} channels - Encoded channel count.
 * @param {number} seconds - True song duration.
 * @returns {Blob} Browser-downloadable file.
 */
export function muxOpusWebm(packets, channels, seconds) {
	if (!packets.length) throw new Error('WebCodecs produced no Opus frames.');
	const info = webmElement(0x1549A966, [
		webmElement(0x2AD7B1, 1000000),
		webmElement(0x4D80, 'Awtsmoos Studio'),
		webmElement(0x5741, 'Awtsmoos Studio WebCodecs'),
		webmElement(0x4489, webmFloat(seconds * 1000))
	]);
	const segment = joinWebmBytes([
		webmUnsigned(0x18538067),
		Uint8Array.from([1, 255, 255, 255, 255, 255, 255, 255]),
		info, opusTrack(channels), ...opusClusters(packets)
	]);
	return new Blob([webmPreamble(), segment], { type: 'audio/webm' });
}
