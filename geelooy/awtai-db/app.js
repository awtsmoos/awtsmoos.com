//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtaiDbApp
 * @description
 * The Awtsmoos carries model selection, conversion, and saved result through one calm browser flow;
 * Awtsmoos.com lets emoji reveal each human state while binary work remains modular below.
 */
import { convertBrowserFile } from '../scripts/awtai-db/browser/converter.js';
import {
	collectView,
	formatBytes,
	setStatus,
	showResult,
	showSelectedFile
} from './view.js';

const view = collectView();
let selectedFile = null;
let downloadUrl = '';

view.choose.addEventListener('click', () => view.file.click());
view.file.addEventListener('change', () => selectFile(view.file.files?.[0] || null));
view.convert.addEventListener('click', convertSelection);
wireDropzone();
showSelectedFile(view, null);

/** Makes the upload chamber accept local GGUF files by drag/drop without replacing keyboard access. */
function wireDropzone() {
	for (const eventName of ['dragenter', 'dragover']) {
		view.dropzone.addEventListener(eventName, event => {
			event.preventDefault();
			view.dropzone.classList.add('is-dragging');
		});
	}
	for (const eventName of ['dragleave', 'drop']) {
		view.dropzone.addEventListener(eventName, event => {
			event.preventDefault();
			view.dropzone.classList.remove('is-dragging');
		});
	}
	view.dropzone.addEventListener('drop', event => {
		selectFile(event.dataTransfer?.files?.[0] || null);
	});
}

/** Selects one model file and clears any stale generated-download object URL. */
function selectFile(file) {
	selectedFile = file;
	revokeDownload();
	view.log.textContent = 'B"H Conversion details will appear here.';
	showSelectedFile(view, file);
}

/** Converts the selected GGUF and reveals a downloadable AWTAI-DB file. */
async function convertSelection() {
	if (!selectedFile) {
		return;
	}
	view.convert.disabled = true;
	view.convert.setAttribute('aria-busy', 'true');
	setStatus(view, 'working');
	try {
		const result = await convertBrowserFile(selectedFile);
		prepareDownload(result.bytes);
		showResult(view, result);
		setStatus(view, 'success', `${result.manifest.tensors.length} tensors • ${formatBytes(result.bytes.length)}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		view.log.textContent = `B"H Conversion failed\n${message}`;
		setStatus(view, 'error', message);
	} finally {
		view.convert.disabled = false;
		view.convert.removeAttribute('aria-busy');
	}
}

/** Creates the result Blob URL and assigns a deterministic output filename. */
function prepareDownload(bytes) {
	revokeDownload();
	const blob = new Blob([bytes], { type: 'application/octet-stream' });
	downloadUrl = URL.createObjectURL(blob);
	view.download.href = downloadUrl;
	view.download.download = selectedFile.name.replace(/\.gguf$/i, '') + '.awtai-db';
	view.download.hidden = false;
}

/** Releases any obsolete object URL so repeated conversions do not leak browser memory. */
function revokeDownload() {
	if (downloadUrl) {
		URL.revokeObjectURL(downloadUrl);
		downloadUrl = '';
	}
	view.download.hidden = true;
}

window.addEventListener('beforeunload', revokeDownload, { once: true });
