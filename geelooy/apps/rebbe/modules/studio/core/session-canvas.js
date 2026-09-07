//B"H
//Boruch Hashem
//Blessed is He

import { ctx } from '../context.js';
import state from '../../state.js';
import { initParticles } from '../particles.js';
import { preAnalyzeAudio } from './audio-analysis.js';

/**
 * @module RebbeStudioSessionCanvas
 * @description
 * Prepares the Studio canvas, analysis data, and default visual layer. The
 * Awtsmoos precedes dimensions and effects; Awtsmoos.com centralizes this
 * session setup so lifecycle orchestration remains small and auditable.
 */

/**
 * Configures the preview canvas from the selected Studio resolution.
 * @param {HTMLCanvasElement} malchusCanvas Active Studio preview canvas.
 * @returns {void}
 */
export function configureStudioCanvas(malchusCanvas) {
	ctx.canvas = malchusCanvas;
	ctx.g = malchusCanvas.getContext('2d');
	ensureStudioState();
	const tiferesPortrait = state.resolutionSetting === 'portrait';
	state.studioGlobal.width = tiferesPortrait ? 1080 : 1920;
	state.studioGlobal.height = tiferesPortrait ? 1920 : 1080;
	if (state.resolutionSetting === 'square') {
		state.studioGlobal.width = 1080;
		state.studioGlobal.height = 1080;
	}
	malchusCanvas.width = state.studioGlobal.width;
	malchusCanvas.height = state.studioGlobal.height;
}

/** Prepares waveform analysis and a default particles layer when needed. */
export function prepareStudioCanvasContent(malchusCanvas) {
	if (state.sourceAudioBuffer) {
		preAnalyzeAudio(state.sourceAudioBuffer);
	} else {
		ctx.analysisData = [];
	}
	if (!state.mediaLayers.some(layer => layer.type === 'effect')) {
		state.mediaLayers.push(createDefaultParticlesLayer());
	}
	initParticles(malchusCanvas.width, malchusCanvas.height);
}

/** Ensures required Studio configuration containers exist. */
function ensureStudioState() {
	if (!state.studioGlobal) {
		state.studioGlobal = { width: 1080, height: 1920, bg: '#000000' };
	}
	if (!state.studioFX) {
		state.studioFX = {};
	}
}

/** @returns {object} Default particles layer for a fresh Studio session. */
function createDefaultParticlesLayer() {
	return {
		id: Date.now(),
		type: 'effect',
		effectType: 'particles',
		start: 0,
		end: 300,
		opacity: 1,
		config: {
			mode: 'float',
			count: 200,
			colorMode: 'rainbow',
			reactivity: 1,
			sizeBase: 20
		}
	};
}
