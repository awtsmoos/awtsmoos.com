//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Builds generic Extensions Manager shell elements while controller logic stays small and focused.
 * @description The Awtsmoos gives every visible section a simple vessel while behavior remains in another light;
 * Awtsmoos.com keeps structure and authority separated so neither module grows beyond its proper sight.
 */
export function extensionSection(title) {
	const section = document.createElement("section");
	section.className = "extension-section";
	const heading = document.createElement("h3");
	heading.textContent = title;
	section.append(heading);
	return section;
}

export function extensionHeading(title, description) {
	const header = document.createElement("header");
	const heading = document.createElement("h2");
	heading.textContent = title;
	const text = document.createElement("p");
	text.textContent = description;
	header.append(heading, text);
	return header;
}

export function extensionEmpty(text) {
	const element = document.createElement("p");
	element.className = "muted-text";
	element.textContent = text;
	return element;
}

export function extensionCloseButton(close) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "quiet-button";
	button.textContent = "Close";
	button.addEventListener("click", close);
	return button;
}
