//B"H
//Boruch Hashem
//Blessed be He

import { buildProviderPanel } from "./surfaceProvider.js";

/**
 * Builds the futuristic Media Library shell without provider logic.
 * The surface exposes stable data hooks so uploads, filtering, and copy actions
 * remain testable independently from layout and styling.
 */
export function createMediaLibrarySurface() {
	const root = element("main", "mediaLibrary");
	const header = buildHeader();
	const toolbar = buildToolbar();
	const upload = buildUploadPanel();
	const provider = buildProviderPanel();
	const grid = element("section", "mediaLibrary__grid");
	grid.dataset.mediaGrid = "true";
	const empty = text("p", "mediaLibrary__empty", "Upload or add an image URL to begin your library.");
	empty.dataset.mediaEmpty = "true";
	grid.append(empty);
	root.append(header, toolbar, upload, provider, grid);
	return Object.freeze({ root, grid, empty });
}

function buildHeader() {
	const header = element("header", "mediaLibrary__hero");
	const copy = element("div", "mediaLibrary__heroCopy");
	copy.append(
		text("p", "mediaLibrary__eyebrow", 'B"H · Awtsmoos Assets'),
		text("h1", "", "Media Library"),
		text("p", "mediaLibrary__lead", "Upload once. Reuse everywhere. Copy permanent public URLs in one tap.")
	);
	const badge = text("div", "mediaLibrary__heroBadge", "✦ Upload · Organize · Publish");
	header.append(copy, badge);
	return header;
}

function buildToolbar() {
	const bar = element("section", "mediaLibrary__toolbar");
	const search = input("search", "Search images, tags, or categories…", "mediaSearch");
	const select = element("select", "mediaLibrary__select");
	select.dataset.mediaCategory = "true";
	for (const value of ["All", "Background", "Header", "Torah", "Oral Torah", "Chassidus", "Profile", "Post", "Other"]) {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = value;
		select.append(option);
	}
	bar.append(search, select);
	return bar;
}

function buildUploadPanel() {
	const panel = element("section", "mediaLibrary__uploadPanel");
	panel.dataset.mediaDrop = "true";
	panel.append(
		text("div", "mediaLibrary__uploadIcon", "⇧"),
		text("h2", "", "Drop images here"),
		text("p", "", "or choose files from this device")
	);
	const choose = button("Choose Images", "mediaChoose");
	const native = button("Upload to Awtsmoos", "mediaUploadAwtsmoos");
	const imgbb = button("Upload to ImgBB", "mediaUploadImgbb");
	const actions = element("div", "mediaLibrary__uploadActions");
	actions.append(choose, native, imgbb);
	const file = input("file", "", "mediaFile");
	file.accept = "image/*";
	file.multiple = true;
	file.hidden = true;
	panel.append(actions, file);
	return panel;
}

function element(tag, className = "") {
	const node = document.createElement(tag);
	node.className = className;
	return node;
}

function text(tag, className, value) {
	const node = element(tag, className);
	node.textContent = value;
	return node;
}

function input(type, placeholder, hook) {
	const node = element("input", "mediaLibrary__input");
	node.type = type;
	node.placeholder = placeholder;
	node.dataset[hook] = "true";
	return node;
}

function button(label, hook) {
	const node = text("button", "mediaLibrary__button", label);
	node.type = "button";
	node.dataset[hook] = "true";
	return node;
}
