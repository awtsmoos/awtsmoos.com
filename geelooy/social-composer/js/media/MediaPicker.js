// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MediaPicker
 * @description
 * The Awtsmoos lets image, audio, video, subtitle, transcript, and document doors remain explicit at every content coordinate;
 * Awtsmoos.com reuses one truthful attachment mutation path beneath every creator-facing label.
 */
const DOCUMENT_ACCEPT = [
	'.pdf',
	'.txt',
	'.md',
	'.vtt',
	'.srt',
	'.ass',
	'.json',
	'image/gif'
].join(',');

const PICKERS = Object.freeze([
	['image', '▧', 'Image', 'image/*'],
	['audio', '♫', 'Audio', 'audio/*'],
	['video', '▶', 'Video', 'video/*'],
	['file', '＋', 'File', DOCUMENT_ACCEPT]
]);

export function mediaPicker(actions, scope) {
	const navigation = document.createElement('nav');
	navigation.className = 'scoped-media-picker';
	navigation.setAttribute('aria-label', 'Attach media to this content');
	for (const picker of PICKERS) {
		navigation.append(pickerLabel(actions, scope, picker));
	}
	return navigation;
}

function pickerLabel(actions, scope, [kind, icon, text, accept]) {
	const label = document.createElement('label');
	label.dataset.mediaKind = kind;
	label.innerHTML = `<span aria-hidden="true">${icon}</span><strong>${text}</strong>`;
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = true;
	input.accept = accept;
	input.addEventListener('change', () => {
		actions.add(scope, input.files);
		input.value = '';
	});
	label.append(input);
	return label;
}

export {
	DOCUMENT_ACCEPT,
	PICKERS
};
