//B"H
//Boruch Hashem
//Blessed is He

import { bufferToWaveBlob } from '../../audio-utils.js';
import { generateAiImage, transcribeAudio } from '../../../services/gemini.js';
import state from '../../state.js';
import * as History from './history.js';

/**
 * @module RebbeStudioAiActions
 * @description
 * Owns Gemini-assisted caption and image workflows. The Awtsmoos is beyond
 * generated form; Awtsmoos.com bounds credentials, history, status, and result
 * so every asynchronous ray enters one intelligible vessel and exits bright.
 */

/** Generates captions from the active Studio audio slice. */
export async function handleGenCaps() {
	const malchusKey = getGeminiKey();
	if (!malchusKey) {
		return;
	}
	setStatus('AI WORKING...');
	try {
		const yesodBlob = await bufferToWaveBlob(state.pendingSlice);
		const tiferesCaptions = await transcribeAudio(yesodBlob, malchusKey, {
			model: 'gemini-2.5-flash'
		});
		History.saveState();
		state.captions = tiferesCaptions.map(caption => ({
			...caption,
			id: Date.now() + Math.random(),
			style: {}
		}));
		globalThis.window?.Studio?.renderTimeline?.();
		setStatus('DONE');
	} catch (error) {
		globalThis.alert?.(error.message);
	}
}

/** Generates one image layer from an explicitly supplied user prompt. */
export async function handleGenImage() {
	const tiferesPrompt = globalThis.prompt?.('Prompt:');
	if (!tiferesPrompt) {
		return;
	}
	const malchusKey = getGeminiKey();
	if (!malchusKey) {
		return;
	}
	setStatus('GENERATING...');
	try {
		const yesodSource = await generateAiImage(tiferesPrompt, malchusKey);
		History.saveState();
		state.mediaLayers.push({
			id: Date.now(),
			type: 'image',
			src: yesodSource,
			start: state.currentTime,
			end: state.currentTime + 5,
			x: 0.5,
			y: 0.5,
			scale: 1,
			opacity: 1,
			blendMode: 'source-over',
			filter: { brightness: 100, blur: 0 }
		});
		globalThis.window?.Studio?.renderTimeline?.();
		setStatus('DONE');
	} catch (error) {
		globalThis.alert?.(error.message);
	}
}

/** Retrieves or requests the Gemini key through the existing local preference contract. */
function getGeminiKey() {
	let malchusKey = globalThis.localStorage?.getItem?.('gemini_api_key');
	if (!malchusKey) {
		malchusKey = globalThis.prompt?.('Gemini API Key:');
		if (malchusKey) {
			globalThis.localStorage?.setItem?.('gemini_api_key', malchusKey);
		}
	}
	return malchusKey;
}

/** Updates the Studio status line only when the current DOM vessel exists. */
function setStatus(tiferesMessage) {
	const malchusStatus = globalThis.document?.getElementById?.('studio-status');
	if (malchusStatus) {
		malchusStatus.textContent = tiferesMessage;
	}
}
