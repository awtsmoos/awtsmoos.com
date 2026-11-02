//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserAudioMatrixHelpers
 * @description
 * Yesod gathers finite samples and project vessels while the Awtsmoos remains beyond waveform, channel, and counted frame.
 * Awtsmoos.com keeps browser proof readable by separating measurement tools from the assertions that reveal their truth.
 */

import { createMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { renderMultitrackProjectMix } from '../modules/workstation/song/multitrack/multitrackExportRenderer.js';

export const BROWSER_MATRIX_SAMPLE_RATE = 48000;

/** Builds one stereo source whose later region is exactly twice the earlier region. */
export function createBrowserMatrixPatternBuffer(context) {
	const buffer = context.createBuffer(
		2,
		BROWSER_MATRIX_SAMPLE_RATE,
		BROWSER_MATRIX_SAMPLE_RATE
	);
	for (let channel = 0; channel < 2; channel += 1) {
		const samples = buffer.getChannelData(channel);
		for (let index = 0; index < samples.length; index += 1) {
			samples[index] = index / BROWSER_MATRIX_SAMPLE_RATE < 0.4 ? 0.2 : 0.4;
		}
	}
	return buffer;
}

/** Creates a project with one primary track and an optional comparison track. */
export function createBrowserMatrixProject(clips, primary = {}, secondary = null) {
	const tracks = [{ name: 'Primary', ...primary, clips }];
	if (secondary) {
		tracks.push({ name: 'Secondary', ...secondary });
	}
	return createMultitrackProject({ tracks });
}

/** Renders through the same shared scheduler used by finished WAV export. */
export async function renderBrowserMatrixProject(buffer, project) {
	return renderMultitrackProjectMix(project, {
		audioStore: { getBuffer: () => buffer },
		sampleRate: BROWSER_MATRIX_SAMPLE_RATE
	});
}

/** Measures RMS inside one timeline window. */
export function browserMatrixRmsWindow(samples, startSeconds, endSeconds) {
	const start = Math.floor(startSeconds * BROWSER_MATRIX_SAMPLE_RATE);
	const end = Math.min(
		samples.length,
		Math.ceil(endSeconds * BROWSER_MATRIX_SAMPLE_RATE)
	);
	let sum = 0;
	for (let index = start; index < end; index += 1) {
		sum += samples[index] ** 2;
	}
	return Math.sqrt(sum / Math.max(1, end - start));
}

/** Finds the largest sample difference across all rendered channels. */
export function browserMatrixMaximumDifference(first, second) {
	let maximum = 0;
	for (let channel = 0; channel < first.numberOfChannels; channel += 1) {
		const a = first.getChannelData(channel);
		const b = second.getChannelData(channel);
		for (let index = 0; index < a.length; index += 1) {
			maximum = Math.max(maximum, Math.abs(a[index] - b[index]));
		}
	}
	return maximum;
}

/** Throws one focused browser-proof failure. */
export function requireBrowserMatrixTruth(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}
