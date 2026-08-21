//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiDbView
 * @description
 * The Awtsmoos gives model, progress, result, and error each a finite friendly face;
 * Awtsmoos.com lets emoji lead identity while accessible text keeps every state in place.
 */

/** Collects the stable AWTAI workspace elements once for the controller. */
export function collectView(documentRoot = document) {
	return {
		file: documentRoot.getElementById('file'),
		choose: documentRoot.getElementById('chooseFile'),
		convert: documentRoot.getElementById('convert'),
		download: documentRoot.getElementById('download'),
		dropzone: documentRoot.getElementById('dropzone'),
		fileName: documentRoot.getElementById('fileName'),
		fileMeta: documentRoot.getElementById('fileMeta'),
		statusEmoji: documentRoot.getElementById('statusEmoji'),
		statusTitle: documentRoot.getElementById('statusTitle'),
		statusMessage: documentRoot.getElementById('statusMessage'),
		log: documentRoot.getElementById('log')
	};
}

/** Reveals selected-file identity without replacing the native file chooser semantics. */
export function showSelectedFile(view, file) {
	view.fileName.textContent = file?.name || 'No GGUF selected';
	view.fileMeta.textContent = file
		? `${formatBytes(file.size)} • ready for local conversion`
		: 'Choose or drop a .gguf model file';
	view.convert.disabled = !file;
	view.download.hidden = true;
	setStatus(view, file ? 'ready' : 'idle');
}

/** Updates the compact live status chamber using emoji-led identity and accessible copy. */
export function setStatus(view, state, detail = '') {
	const states = {
		idle: ['🧠', 'Foundry ready', 'Your model stays in this browser tab.'],
		ready: ['📦', 'GGUF ready', 'Review the file, then begin conversion.'],
		working: ['⚙️', 'Converting model', 'Reading tensors and assembling AWTAI execution packets…'],
		success: ['✅', 'Conversion complete', detail || 'Your AWTAI-DB file is ready to save.'],
		error: ['⚠️', 'Conversion failed', detail || 'The GGUF could not be converted.']
	};
	const [emoji, title, message] = states[state] || states.idle;
	view.statusEmoji.textContent = emoji;
	view.statusTitle.textContent = title;
	view.statusMessage.textContent = message;
	view.dropzone.dataset.state = state;
}

/** Shows manifest diagnostics after conversion without forcing them into the primary workflow. */
export function showResult(view, result) {
	view.log.textContent = JSON.stringify({
		status: 'converted',
		name: result.manifest.name,
		tensors: result.manifest.tensors.length,
		packets: result.manifest.packets.length,
		outputBytes: result.bytes.length,
		diskFirst: result.manifest.diskFirst
	}, null, 2);
}

/** Formats file and output sizes into compact human-readable units. */
export function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes < 1024) {
		return `${bytes || 0} B`;
	}
	const units = ['KB', 'MB', 'GB', 'TB'];
	let value = bytes;
	let unit = -1;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
}
