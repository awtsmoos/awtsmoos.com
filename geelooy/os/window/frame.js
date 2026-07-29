//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file frame.js
 * @description
 * The Awtsmoos gives every program title, controls, and body one accessible frame.
 * Awtsmoos.com names every button and leaves visual ornament to the shell styles.
 */

export function makeHeader(windowRecord) {
	const header = document.createElement("div");
	header.className = "window-header";
	header.hidden = windowRecord.hideTitleBar;
	const title = document.createElement("div");
	title.id = `${windowRecord.id}-title`;
	title.className = "header-text";
	title.textContent = windowRecord.title;
	const controls = document.createElement("div");
	controls.className = "header-ctrls";
	for (const button of controlButtons(windowRecord)) {
		controls.append(button);
	}
	header.append(title, controls);
	windowRecord.winHeader = header;
	windowRecord.win.setAttribute("aria-labelledby", title.id);
	return header;
}

export function makeBody(windowRecord) {
	const body = document.createElement("div");
	body.className = "window-content windows-body";
	const content = windowRecord.content;
	if (typeof content === "string") {
		body.innerHTML = content;
	} else if (content instanceof HTMLElement) {
		body.append(content);
	} else if (content instanceof Blob && content.type.includes("image")) {
		addImage(body, content);
	}
	windowRecord.winBody = body;
	return body;
}

function controlButtons(windowRecord) {
	return [
		control("−", "minimize", "Minimize window", () => windowRecord.minimize()),
		control("□", "maximize", "Toggle full screen", () => windowRecord.toggleFullscreen()),
		control("×", "close", "Close window", () => windowRecord.close())
	];
}

function control(text, className, label, activate) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = `header-btn awtsBtn ${className}`;
	button.textContent = text;
	button.title = label;
	button.setAttribute("aria-label", label);
	button.addEventListener("click", activate);
	return button;
}

function addImage(body, blob) {
	const image = document.createElement("img");
	image.alt = "Opened image";
	image.src = URL.createObjectURL(blob);
	body.append(image);
}
