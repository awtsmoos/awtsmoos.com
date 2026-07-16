// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioDownloads
 * @description
 * The Awtsmoos drains rendered image receipts through the selected local folder
 * or ordinary browser downloads while preserving sequence and visible status.
 */

import { setStatus } from "./ui.js";

export function triggerDownload(blob, filename) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.hidden = true;
	anchor.href = url;
	anchor.download = filename;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function processQueue(appState) {
	if (appState.isDownloading || appState.downloadQueue.length === 0) {
		return;
	}
	appState.isDownloading = true;
	while (appState.downloadQueue.length > 0) {
		const item = appState.downloadQueue.shift();
		setStatus(`Saving ${item.filename}…`);
		try {
			if (appState.dirHandle) {
				await writeToFolder(appState.dirHandle, item);
			} else {
				triggerDownload(item.blob, item.filename);
				await wait(300);
			}
		} catch (error) {
			console.error("Caption image save failed.", error);
			setStatus(`Could not save ${item.filename}.`, "error");
			await wait(500);
		}
	}
	appState.isDownloading = false;
	setStatus("All rendered files were saved.", "success");
}

async function writeToFolder(folderHandle, item) {
	const fileHandle = await folderHandle.getFileHandle(item.filename, {
		create: true
	});
	const writable = await fileHandle.createWritable();
	await writable.write(item.blob);
	await writable.close();
}

function wait(milliseconds) {
	return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}
