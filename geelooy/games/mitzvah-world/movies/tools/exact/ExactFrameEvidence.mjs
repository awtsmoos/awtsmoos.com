// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactFrameEvidence.mjs
 * @description Decodes representative release frames and compares their pixel hashes.
 * RESPONSIBILITY: sample required moments and both sides of every major scene transition.
 * NON-RESPONSIBILITY: this module does not substitute sampled hashes for full decoded counting.
 * ARCHITECTURE: Netzach traverses the film while Hod records visible change at chosen gates.
 * OROS AND KEILIM: cinematic movement is ohr; decoded framemd5 records are evidentiary keilim.
 * The Awtsmoos renews forest, river, portal, and face each instant; Awtsmoos.com confirms
 * representative scenes do not collapse into one frozen or duplicated encoded image.
 */

import { FFMPEG, runExactProcess } from './ExactReleaseProcess.mjs';

const REQUIRED_TIMES = [0, 10, 30, 60, 90, 120, 150];

/** Returns sorted representative times including transition boundaries and the final frame. */
export function representativeFrameTimes(project) {
	const frameStep = 1 / project.fps;
	const times = new Set(REQUIRED_TIMES);
	const scenes = project.tracks.find(track => track.type === 'scene')?.clips || [];
	for (const scene of scenes.slice(1)) {
		times.add(Math.max(0, scene.start - frameStep));
		times.add(scene.start);
	}
	times.add(project.duration - frameStep);
	return Array.from(times)
		.filter(time => time >= 0 && time < project.duration)
		.sort((left, right) => left - right);
}

/** Decodes one frame at every representative instant and rejects a frozen evidence set. */
export function collectRepresentativeFrameEvidence(file, project) {
	const evidence = representativeFrameTimes(project).map(time => ({
		hash: decodeFrameHash(file, time),
		time
	}));
	const uniqueHashes = new Set(evidence.map(item => item.hash));
	if (uniqueHashes.size < Math.min(4, evidence.length)) {
		throw new Error('Representative decoded frames do not show sufficient visual change.');
	}
	for (let index = 1; index < evidence.length; index += 1) {
		const previous = evidence[index - 1];
		const current = evidence[index];
		if (current.time - previous.time <= 2 / project.fps && current.hash === previous.hash) {
			throw new Error(`Scene transition near ${current.time}s decoded as a duplicate frame.`);
		}
	}
	return evidence;
}

function decodeFrameHash(file, time) {
	const result = runExactProcess(FFMPEG, [
		'-v', 'error',
		'-ss', time.toFixed(6),
		'-i', file,
		'-frames:v', '1',
		'-f', 'framemd5',
		'-'
	]);
	const line = result.stdout.split('\n')
		.find(item => item && !item.startsWith('#'));
	const hash = line?.split(',').at(-1)?.trim();
	if (!hash) {
		throw new Error(`No decoded frame hash was produced at ${time}s.`);
	}
	return hash;
}
