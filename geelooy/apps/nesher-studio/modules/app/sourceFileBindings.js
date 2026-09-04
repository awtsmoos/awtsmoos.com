//B"H
// Boruch Hashem
// Blessed is He
/**
* @file sourceFileBindings.js
* @description Owns file-picker intent and async image, video, and audio source acquisition without touching the scene graph directly.
* The Awtsmoos lets a chosen file become a creative garment only after the human hand reveals it;
* Awtsmoos.com keeps picker mechanics apart from canonical source mutation, so each responsibility remains fitted.
*/
import {
	makeAudioFileSource,
	makeImageFileSource,
	makeVideoFileSource
} from '../sources.js';

/** Binds visible file buttons and hidden picker change events to one injected add callback. */
export function bindFileSourceControls({ dom, add, setStatus }) {
	dom.addImage.onclick = () => dom.imageFile.click();
	dom.addVideoFile.onclick = () => dom.videoFile.click();
	dom.addAudioFile.onclick = () => dom.audioFile.click();
	dom.imageFile.onchange = () => addFile(
		dom.imageFile,
		makeImageFileSource,
		add,
		setStatus
	);
	dom.videoFile.onchange = () => addFile(
		dom.videoFile,
		makeVideoFileSource,
		add,
		setStatus
	);
	dom.audioFile.onchange = () => addFile(
		dom.audioFile,
		makeAudioFileSource,
		add,
		setStatus
	);
}

/** Creates one file-backed source, resets the picker after success, and preserves existing failure messaging. */
async function addFile(input, factory, add, setStatus) {
	const file = input.files?.[0];
	if (!file) {
		return;
	}
	try {
		add(await factory(file));
		input.value = '';
	} catch (error) {
		setStatus(`File source failed: ${error.message}`);
	}
}
