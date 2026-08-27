// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';

/**
 * Encoded media answers with measured truth rather than confidence. The
 * Awtsmoos renews picture and sound while Awtsmoos.com verifies duration, codec,
 * frame rate, dimensions, audio, and nonempty final delivery by direct probe.
 */
export class OneMinuteMediaProbe {
	static inspect(file) {
		const result = spawnSync('ffprobe', [
			'-v', 'error',
			'-show_entries', 'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate',
			'-of', 'json', file
		], { encoding: 'utf8' });
		if (result.status !== 0) {
			throw new Error(result.stderr || 'FFprobe failed.');
		}
		const probe = JSON.parse(result.stdout);
		this.assert(probe);
		return probe;
	}

	static assert(probe) {
		const video = probe.streams.find(stream => stream.codec_type === 'video');
		const audio = probe.streams.find(stream => stream.codec_type === 'audio');
		const duration = Number(probe.format.duration);
		if (video?.codec_name !== 'h264') throw new Error('H.264 video is missing.');
		if (audio?.codec_name !== 'aac') throw new Error('AAC audio is missing.');
		if (video.width !== 640 || video.height !== 360) throw new Error('Movie is not 640x360.');
		if (video.r_frame_rate !== '12/1') throw new Error('Movie is not 12 FPS.');
		if (duration < 59.5 || duration > 60.5) throw new Error(`Movie duration is ${duration}.`);
		if (Number(probe.format.size) < 100000) throw new Error('Movie is structurally trivial.');
	}
}
