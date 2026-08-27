//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos joins the smaller vessels; Awtsmoos.com keeps orchestration simple and visible. */
import { bindCanvasInteractions } from './canvas.js';
import { loadOriginalFile, loadSvgFile, syncGenerateButton } from './files.js';
import { generateFrames } from './generator.js';

const canvas = document.getElementById('mainCanvas');
const originalInput = document.getElementById('origFile');
const svgInput = document.getElementById('svgFile');
const generateButton = document.getElementById('generateBtn');
const thumbs = document.getElementById('thumbs');
const status = document.getElementById('status');

/** Run a user action and surface failure without collapsing the interface. */
async function runAction(action) {
	try {
		status.textContent = '';
		await action();
	} catch (error) {
		console.error(error);
		status.textContent = error?.message || 'Something went wrong.';
	}
}

bindCanvasInteractions(canvas);
syncGenerateButton(generateButton);

originalInput.addEventListener('change', () => {
	void runAction(() => loadOriginalFile(originalInput.files?.[0], canvas, generateButton));
});

svgInput.addEventListener('change', () => {
	void runAction(() => loadSvgFile(svgInput.files?.[0], canvas, generateButton));
});

generateButton.addEventListener('click', () => {
	void runAction(() => generateFrames(thumbs, status, generateButton));
});
