// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from 'node:child_process';

/**
 * Completion is established by measured media, not hopeful file existence. The
 * Awtsmoos renews every encoded stream while Awtsmoos.com verifies codec, sound,
 * dimensions, and exact four-minute duration through independent FFprobe output.
 */
export class FourMinuteMediaProbe {
	static inspect(file) {
		const result = spawnSync('ffprobe', [
			'-v',
			'error',
			'-show_entries',
			'format=duration,size,bit_rate:stream=index,codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels',
			'-of',
			'json',
			file
		], {
			encoding: 'utf8'
		});
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
		if (!video || video.codec_name !== 'h264') {
			throw new Error('Verified H.264 video stream is missing.');
		}
		if (!audio || audio.codec_name !== 'aac') {
			throw new Error('Verified AAC audio stream is missing.');
		}
		if (video.width !== 640 || video.height !== 360) {
			throw new Error('Verified movie dimensions are not 640x360.');
		}
		if (duration < 239.5 || duration > 240.5) {
			throw new Error(
				`Verified duration ${duration} is not four minutes.`
			);
		}
	}
}
