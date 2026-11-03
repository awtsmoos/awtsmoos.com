//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserAudioMatrixFixture
 * @description
 * Netzach compares living rendered samples while the Awtsmoos remains beyond channel, gain, cut, and source-time boundary.
 * Awtsmoos.com proves mute, solo, pan, track gain, trim, and split through real OfflineAudioContext output instead of metadata alone.
 */

import { splitMultitrackClip } from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { createMultitrackClip } from '../modules/workstation/song/multitrack/multitrackProject.js';
import {
	browserMatrixMaximumDifference,
	browserMatrixRmsWindow,
	createBrowserMatrixPatternBuffer,
	createBrowserMatrixProject,
	renderBrowserMatrixProject,
	requireBrowserMatrixTruth
} from './multitrackBrowserAudioMatrixHelpers.js';

/** Renders comparative projects and rejects any mixer policy that changes expected samples. */
export async function runBrowserAudioMatrixFixture() {
	const context = new AudioContext();
	const buffer = createBrowserMatrixPatternBuffer(context);
	const clip = createMultitrackClip({
		id: 'matrix-clip',
		bufferId: 'matrix',
		timelineStart: 0.1,
		sourceOffset: 0.2,
		duration: 0.4
	});
	try {
		const reference = await renderBrowserMatrixProject(
			buffer,
			createBrowserMatrixProject([clip])
		);
		const [left, right] = splitMultitrackClip(clip, 0.3);
		const split = await renderBrowserMatrixProject(
			buffer,
			createBrowserMatrixProject([left, right])
		);
		const muted = await renderBrowserMatrixProject(buffer, createBrowserMatrixProject(
			[clip],
			{},
			{ muted: true, gain: 2, clips: [{ ...clip, id: 'muted-clip', gain: 2 }] }
		));
		const solo = await renderBrowserMatrixProject(buffer, createBrowserMatrixProject(
			[clip],
			{ solo: true },
			{ gain: 2, clips: [{ ...clip, id: 'solo-excluded', gain: 2 }] }
		));
		const halfGain = await renderBrowserMatrixProject(
			buffer,
			createBrowserMatrixProject([clip], { gain: 0.5 })
		);
		const panned = await renderBrowserMatrixProject(
			buffer,
			createBrowserMatrixProject([clip], { pan: 0.7 })
		);
		const splitDifference = browserMatrixMaximumDifference(reference, split);
		const mutedDifference = browserMatrixMaximumDifference(reference, muted);
		const soloDifference = browserMatrixMaximumDifference(reference, solo);
		const referenceRms = browserMatrixRmsWindow(reference.getChannelData(0), 0.15, 0.25);
		const halfGainRms = browserMatrixRmsWindow(halfGain.getChannelData(0), 0.15, 0.25);
		const earlyTrimRms = browserMatrixRmsWindow(reference.getChannelData(0), 0.15, 0.25);
		const lateTrimRms = browserMatrixRmsWindow(reference.getChannelData(0), 0.35, 0.45);
		const panLeftRms = browserMatrixRmsWindow(panned.getChannelData(0), 0.15, 0.25);
		const panRightRms = browserMatrixRmsWindow(panned.getChannelData(1), 0.15, 0.25);
		const gainRatio = halfGainRms / referenceRms;
		requireBrowserMatrixTruth(splitDifference < 0.00001, `Split changed samples by ${splitDifference}`);
		requireBrowserMatrixTruth(mutedDifference < 0.00001, `Muted track leaked by ${mutedDifference}`);
		requireBrowserMatrixTruth(soloDifference < 0.00001, `Solo policy leaked by ${soloDifference}`);
		requireBrowserMatrixTruth(Math.abs(gainRatio - 0.5) < 0.03, `Track gain ratio was ${gainRatio}`);
		requireBrowserMatrixTruth(lateTrimRms > earlyTrimRms * 1.8, 'Trim timing missed later source region');
		requireBrowserMatrixTruth(panRightRms > panLeftRms * 1.3, 'Positive pan did not favor right channel');
		return {
			passed: true,
			splitDifference,
			mutedDifference,
			soloDifference,
			gainRatio,
			earlyTrimRms,
			lateTrimRms,
			panLeftRms,
			panRightRms
		};
	} finally {
		await context.close();
	}
}
