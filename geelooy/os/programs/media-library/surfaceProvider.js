//B"H
//Boruch Hashem
//Blessed be He

/** Builds provider controls without network behavior. */
export function buildProviderPanel() {
	const panel = node("aside", "mediaLibrary__provider");
	panel.append(
		text("p", "mediaLibrary__eyebrow", "ImgBB Integration"),
		text("h2", "", "Public CDN upload"),
		text("p", "", "Your API key stays in this browser only.")
	);
	const key = input("password", "ImgBB API key", "mediaImgbbKey");
	const keyRow = node("div", "mediaLibrary__providerActions");
	keyRow.append(button("Save Key", "mediaSaveKey"), apiLink());
	const url = input("url", "Paste an existing public image URL…", "mediaUrl");
	const add = button("Add from URL", "mediaAddUrl");
	panel.append(key, keyRow, text("p", "mediaLibrary__providerLabel", "Existing image"), url, add);
	return panel;
}

function apiLink() {
	const link = text("a", "mediaLibrary__apiLink", "Get ImgBB API key ↗");
	link.href = "https://api.imgbb.com/";
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	return link;
}

function node(tag, className = "") {
	const value = document.createElement(tag);
	value.className = className;
	return value;
}

function text(tag, className, value) {
	const element = node(tag, className);
	element.textContent = value;
	return element;
}

function input(type, placeholder, hook) {
	const element = node("input", "mediaLibrary__input");
	element.type = type;
	element.placeholder = placeholder;
	element.dataset[hook] = "true";
	return element;
}

function button(label, hook) {
	const element = text("button", "mediaLibrary__button", label);
	element.type = "button";
	element.dataset[hook] = "true";
	return element;
}
