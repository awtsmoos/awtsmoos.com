//B"H
//Boruch Hashem
//Blessed be He

import { renderMediaGrid } from "./render.js";
import { mediaRecord, readImgbbKey, readMediaLibrary, saveImgbbKey, saveMediaLibrary } from "./storage.js";
import { uploadToAwtsmoos, uploadToImgbb } from "./uploads.js";

/**
 * Coordinates bounded image uploads, URL import, filtering, and asset actions.
 * Remote bytes remain with Awtsmoos or ImgBB; the browser stores metadata only.
 */
export function createMediaLibraryController(surface) {
	const root = surface.root;
	const fileInput = root.querySelector("[data-media-file]");
	const search = root.querySelector("[data-media-search]");
	const category = root.querySelector("[data-media-category]");
	const keyInput = root.querySelector("[data-media-imgbb-key]");
	const urlInput = root.querySelector("[data-media-url]");
	const status = createStatus(root);
	let selectedFiles = [];
	let items = readMediaLibrary();
	keyInput.value = readImgbbKey();

	const refresh = () => renderMediaGrid(surface, items, search.value, category.value);
	const choose = () => fileInput.click();
	const selectFiles = files => {
		selectedFiles = Array.from(files || []).filter(file => /^image\//i.test(file.type));
		setStatus(status, selectedFiles.length ? `${selectedFiles.length} image(s) ready.` : "Choose image files first.");
	};

	async function upload(provider) {
		if (!selectedFiles.length) return setStatus(status, "Choose image files first.", true);
		const key = keyInput.value.trim();
		const uploaded = [];
		try {
			for (let index = 0; index < selectedFiles.length; index++) {
				const file = selectedFiles[index];
				setStatus(status, `Uploading ${index + 1}/${selectedFiles.length}: ${file.name}…`);
				const result = provider === "imgbb"
					? await uploadToImgbb(file, key)
					: await uploadToAwtsmoos(file);
				uploaded.push(mediaRecord({ file, ...result, category: selectedCategory(category.value) }));
			}
			items = saveMediaLibrary([...uploaded, ...items]);
			selectedFiles = [];
			fileInput.value = "";
			refresh();
			setStatus(status, `Uploaded ${uploaded.length} image(s). Public URLs are ready.`);
		} catch (error) {
			setStatus(status, error.message || "Upload failed.", true);
		}
	}

	function importUrl() {
		const raw = urlInput.value.trim();
		if (!raw) return setStatus(status, "Paste an image URL first.", true);
		try {
			const url = new URL(raw, location.origin);
			if (!/^https?:$/.test(url.protocol)) throw new Error("Only http/https URLs are supported.");
			items = saveMediaLibrary([mediaRecord({ url: url.href, provider: "url", category: selectedCategory(category.value) }), ...items]);
			urlInput.value = "";
			refresh();
			setStatus(status, "Public image URL added.");
		} catch (error) {
			setStatus(status, error.message || "Invalid image URL.", true);
		}
	}

	root.querySelector("[data-media-choose]").onclick = choose;
	root.querySelector("[data-media-upload-awtsmoos]").onclick = () => upload("awtsmoos");
	root.querySelector("[data-media-upload-imgbb]").onclick = () => upload("imgbb");
	root.querySelector("[data-media-save-key]").onclick = () => {
		saveImgbbKey(keyInput.value);
		setStatus(status, "ImgBB API key saved in this browser only.");
	};
	root.querySelector("[data-media-add-url]").onclick = importUrl;
	fileInput.onchange = () => selectFiles(fileInput.files);
	search.oninput = refresh;
	category.onchange = refresh;
	wireDrop(root.querySelector("[data-media-drop]"), selectFiles);
	root.onclick = async event => {
		const button = event.target.closest("[data-media-action]");
		if (!button) return;
		const item = items.find(value => value.id === button.dataset.mediaId);
		if (!item) return;
		if (button.dataset.mediaAction === "copy") await navigator.clipboard?.writeText?.(item.url);
		if (button.dataset.mediaAction === "open") globalThis.open?.(item.url, "_blank", "noopener,noreferrer");
		if (button.dataset.mediaAction === "remove") {
			items = saveMediaLibrary(items.filter(value => value.id !== item.id));
			refresh();
		}
	};
	refresh();
	return Object.freeze({ close() {} });
}

function wireDrop(zone, selectFiles) {
	zone.ondragover = event => event.preventDefault();
	zone.ondrop = event => {
		event.preventDefault();
		selectFiles(event.dataTransfer?.files);
	};
}
function selectedCategory(value) { return value === "All" ? "Other" : value; }
function createStatus(root) {
	const node = document.createElement("p");
	node.className = "mediaLibrary__status";
	node.setAttribute("role", "status");
	root.prepend(node);
	return node;
}
function setStatus(node, message, error = false) {
	node.textContent = message;
	node.dataset.error = error ? "true" : "false";
}
