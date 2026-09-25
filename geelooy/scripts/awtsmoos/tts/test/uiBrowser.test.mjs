//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Kokoro Forge UI facade browser contract.
 * @description
 * The Awtsmoos asks the decomposed UI facade to perform every measured mutation on the real Forge DOM;
 * Awtsmoos.com proves public compatibility through behavior, not through file shape alone.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../../../games/city-of-light/tests/BrowserHarness.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const geelooyRoot = path.resolve(here, '../../../..');
const expectedKeys = [
	'textInput', 'rawModeToggle', 'convertIpaBtn', 'tokenList', 'generateBtn',
	'btnText', 'btnSpinner', 'speedSlider', 'speedVal', 'logs', 'statusDot',
	'statusText', 'charCount', 'visualizer', 'visualizerPlaceholder', 'audioPlayer',
	'downloadBtn', 'loadProgressFill', 'loadProgressVal', 'voiceProgressFill',
	'voiceProgressVal', 'genProgressFill', 'genProgressVal', 'modelStatus',
	'voiceStatus', 'tokenizerStatus', 'purgeBtn'
].sort();
async function waitForForge(harness) {
	for (let attempt = 0; attempt < 120; attempt += 1) {
		if (await harness.client.evaluate(`Boolean(document.getElementById('generate-btn'))`)) return;
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error('Kokoro Forge DOM did not awaken');
}
const harness = await createBrowserHarness({ directory: geelooyRoot, port: 44042 });
try {
	await harness.navigate('/scripts/awtsmoos/tts/');
	await waitForForge(harness);
	const result = await harness.client.evaluate(`(async () => {
		const ui = await import('/scripts/awtsmoos/tts/ui.js?uiBrowser=phase2');
		const e = ui.getElements();
		ui.updateDataStatus({ model: true, voice: false, tokenizer: true });
		const data = [e.modelStatus.textContent, e.voiceStatus.textContent, e.tokenizerStatus.textContent, e.modelStatus.className, e.voiceStatus.className];
		ui.updateLoadProgress(150); ui.updateVoiceProgress(-10); ui.updateGenProgress(42.4);
		const progress = [e.loadProgressFill.style.width, e.loadProgressVal.textContent, e.voiceProgressFill.style.width, e.voiceProgressVal.textContent, e.genProgressFill.style.width, e.genProgressVal.textContent];
		ui.updateStatus(true); const online = [e.statusText.textContent, e.statusDot.classList.contains('active'), e.generateBtn.disabled, e.btnText.textContent];
		ui.updateStatus(false); const offline = [e.statusText.textContent, e.statusDot.classList.contains('active'), e.btnText.textContent];
		ui.setProcessing(true); const processing = [e.generateBtn.disabled, e.btnSpinner.classList.contains('hidden'), e.btnText.textContent];
		ui.setProcessing(false); const idle = [e.generateBtn.disabled, e.btnSpinner.classList.contains('hidden'), e.btnText.textContent];
		ui.displayTokens(['hello', 'world']);
		return { keys: Object.keys(e).sort(), missing: Object.entries(e).filter(([, value]) => !value).map(([key]) => key), data, progress, online, offline, processing, idle, tokens: [...e.tokenList.querySelectorAll('.token-chip')].map(node => node.textContent) };
	})()`);
	assert.deepStrictEqual(result.keys, expectedKeys);
	assert.deepStrictEqual(result.missing, []);
	assert.deepStrictEqual(result.data, ['SYNCED', 'MISSING', 'SYNCED', 'status-badge synced', 'status-badge missing']);
	assert.deepStrictEqual(result.progress, ['100%', '100%', '0%', '0%', '42.4%', '42%']);
	assert.deepStrictEqual(result.online, ['SYSTEM READY', true, false, 'IGNITE FORGE']);
	assert.deepStrictEqual(result.offline, ['OFFLINE', false, 'INITIALIZE NEURAL LINK']);
	assert.deepStrictEqual(result.processing, [true, false, 'PROCESSING...']);
	assert.deepStrictEqual(result.idle, [false, true, 'IGNITE FORGE']);
	assert.deepStrictEqual(result.tokens, ['hello', 'world']);
	assert.deepStrictEqual(harness.errors, []);
	assert.deepStrictEqual(harness.networkErrors, []);
	console.log('B"H Kokoro Forge uiBrowser.test passed');
} finally {
	harness.close();
}
