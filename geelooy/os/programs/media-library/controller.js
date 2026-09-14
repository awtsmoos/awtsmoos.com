//B"H
//Boruch Hashem
//Blessed be He

import { handleMediaAction, importedMediaRecord, saveBrowserImgbbKey, selectedMediaCategory, wireMediaDrop } from "./interactions.js";
import { renderMediaGrid } from "./render.js";
import { readImgbbKey, readMediaLibrary, saveMediaLibrary } from "./storage.js";
import { createMediaStatus, setMediaStatus, showMediaUploadResult } from "./status.js";
import { uploadMediaBatch } from "./uploadBatch.js";

/**
 * Coordinates selection, upload, filtering, import, and local asset actions.
 * Public URLs become durable vessels while image bytes remain beyond localStorage.
 */
export function createMediaLibraryController(surface) {
	const root = surface.root;
	const fileInput = root.querySelector("[data-media-file]");
	const search = root.querySelector("[data-media-search]");
	const category = root.querySelector("[data-media-category]");
	const keyInput = root.querySelector("[data-media-imgbb-key]");
	const urlInput = root.querySelector("[data-media-url]");
	const status = createMediaStatus(root);
	let selectedFiles = [];
	let items = readMediaLibrary();
	keyInput.value = readImgbbKey();

	function refresh() {
		renderMediaGrid(surface, items, search.value, category.value);
	}

	function selectFiles(files) {
		selectedFiles = Array.from(files || []).filter(function imageOnly(file) {
			return /^image\//i.test(file.type);
		});
		const message = selectedFiles.length
			? `${selectedFiles.length} image(s) ready.`
			: "Choose image files first.";
		setMediaStatus(status, message);
	}

	async function upload(provider) {
		if (!selectedFiles.length) {
			setMediaStatus(status, "Choose image files first.", true);
			return;
		}
		const apiKey = keyInput.value.trim();
		if (provider === "imgbb" && !apiKey) {
			setMediaStatus(status, "Enter or save an ImgBB API key first.", true);
			return;
		}
		const result = await uploadMediaBatch({
			files: selectedFiles,
			provider,
			apiKey,
			category: selectedMediaCategory(category.value),
			onProgress(progress) {
				setMediaStatus(status, `Uploading ${progress.index}/${progress.total}: ${progress.file.name}…`);
			}
		});
		if (result.records.length) {
			items = saveMediaLibrary([...result.records, ...items]);
			refresh();
		}
		selectedFiles = result.errors.map(function failedUpload(error) {
			return error.file;
		});
		fileInput.value = "";
		showMediaUploadResult(status, result);
	}

	function importUrl() {
		try {
			const record = importedMediaRecord(urlInput.value, selectedMediaCategory(category.value));
			items = saveMediaLibrary([record, ...items]);
			urlInput.value = "";
			refresh();
			setMediaStatus(status, "Public image URL added.");
		} catch (error) {
			setMediaStatus(status, error.message || "Invalid image URL.", true);
		}
	}

	root.querySelector("[data-media-choose]").onclick = function chooseFiles() {
		fileInput.click();
	};
	root.querySelector("[data-media-upload-awtsmoos]").onclick = async function uploadAwtsmoos() {
		await upload("awtsmoos");
	};
	root.querySelector("[data-media-upload-imgbb]").onclick = async function uploadImgbb() {
		await upload("imgbb");
	};
	root.querySelector("[data-media-save-key]").onclick = function saveKey() {
		saveBrowserImgbbKey(keyInput, status);
	};
	root.querySelector("[data-media-add-url]").onclick = importUrl;
	fileInput.onchange = function changeFiles() {
		selectFiles(fileInput.files);
	};
	search.oninput = refresh;
	category.onchange = refresh;
	wireMediaDrop(root.querySelector("[data-media-drop]"), selectFiles);
	root.onclick = async function assetAction(event) {
		await handleMediaAction(event, items, status, function removeItem(id) {
			items = saveMediaLibrary(items.filter(function keepOtherItems(value) {
				return value.id !== id;
			}));
			refresh();
		});
	};
	refresh();
	return Object.freeze({
		close() {
		}
	});
}
