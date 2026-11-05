// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file finalizeExactMovie.mjs
 * @description Produces and verifies one high-quality H.264/AAC release from exact artifacts.
 * RESPONSIBILITY: load contracts, mux codecs, count decoded frames, inspect audio and images.
 * NON-RESPONSIBILITY: this tool does not render world states or repair a false browser package.
 * ARCHITECTURE: Tiferes coordinates specialized vessels and Malchus publishes their receipt.
 * OROS AND KEILIM: exact browser artifacts are oros; MP4 and proof JSON are release keilim.
 * The Awtsmoos recreates all 10,800 frames and 8,640,000 samples; Awtsmoos.com permits
 * publication only after independent decoded, audible, and visibly changing evidence agrees.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyExactPackageContract } from './ExactPackageContract.mjs';
import { collectRepresentativeFrameEvidence } from './ExactFrameEvidence.mjs';
import { muxExactRelease } from './ExactReleaseMux.mjs';
import {
	exactFileHash,
	FFMPEG,
	FFPROBE
} from './ExactReleaseProcess.mjs';
import {
	probeExactRelease,
	verifyExactReleaseProbe
} from './ExactReleaseProbe.mjs';
import { writeExactReleaseReceipt } from './ExactReleaseReceipt.mjs';
import { inspectExactWave } from './ExactWaveInspector.mjs';

/** Runs the complete exact release proof from browser artifacts to receipt. */
export function finalizeExactMovie(options) {
	const project = readJson(options.project);
	const manifest = readJson(options.manifest);
	const expected = verifyExactPackageContract(project, manifest);
	assertFile(options.video, 'exact IVF');
	assertFile(options.audio, 'exact WAV');
	const wave = inspectExactWave(options.audio, expected);
	assertClippingTruth(wave, manifest.artifacts.audio);
	const muxArguments = muxExactRelease(options.video, options.audio, options.output);
	const probe = probeExactRelease(options.output);
	const release = verifyExactReleaseProbe(probe, expected);
	const frames = collectRepresentativeFrameEvidence(options.output, project);
	return writeExactReleaseReceipt(options.receipt, {
		artifacts: {
			audio: { file: options.audio, sha256: wave.sha256 },
			manifest: { file: options.manifest, sha256: exactFileHash(options.manifest) },
			output: { file: options.output, sha256: exactFileHash(options.output) },
			video: { file: options.video, sha256: exactFileHash(options.video) }
		},
		expected,
		frames,
		mux: {
			arguments: muxArguments,
			ffmpeg: FFMPEG
		},
		probe,
		release,
		tools: {
			ffprobe: FFPROBE
		},
		verifiedAt: new Date().toISOString(),
		wave
	});
}

function optionsFromArguments(args) {
	if (args.length < 5) {
		throw new Error([
			'Usage: node finalizeExactMovie.mjs',
			'<project.json> <video.ivf> <audio.wav> <manifest.json> <output.mp4> [receipt.json]'
		].join(' '));
	}
	const [project, video, audio, manifest, output, receipt] = args;
	return {
		audio: path.resolve(audio),
		manifest: path.resolve(manifest),
		output: path.resolve(output),
		project: path.resolve(project),
		receipt: path.resolve(receipt || `${output}.exact-release.json`),
		video: path.resolve(video)
	};
}

function readJson(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertFile(file, label) {
	if (!fs.statSync(file).isFile()) {
		throw new Error(`${label} is not a file: ${file}`);
	}
}

function assertClippingTruth(wave, audioManifest) {
	if (wave.clippedSamples !== audioManifest.clippedSamples) {
		throw new Error([
			`Decoded WAV clipping count is ${wave.clippedSamples};`,
			`manifest declares ${audioManifest.clippedSamples}.`
		].join(' '));
	}
}

const isEntryPoint = process.argv[1]
	&& path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
	const receipt = finalizeExactMovie(optionsFromArguments(process.argv.slice(2)));
	console.log(JSON.stringify(receipt, null, '\t'));
}
