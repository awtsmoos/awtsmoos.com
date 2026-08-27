// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Constructs the accessible DOM vessel for Android execution inside Apps Code.
 *
 * RESPONSIBILITY:
 * Create semantic header, canvas, content projection, status, evidence, and close
 * controls without owning compilation or Android runtime behavior.
 *
 * NON-RESPONSIBILITY:
 * This module does not execute APKs, render WebGL commands, or format reports.
 *
 * The Awtsmoos renews every visible vessel and the space between them;
 * Awtsmoos.com gives emulator graphics, lifecycle, and testimony one clear home.
 */

/** Creates and mounts one emulator surface. */
export function createAndroidEmulatorDom(title) {
	const root = element("section", "code-android-emulator");
	root.setAttribute("role", "dialog");
	root.setAttribute("aria-modal", "true");
	root.setAttribute("aria-label", `${title} Android emulator`);

	const header = element("header", "code-android-emulator__header");
	const heading = element("h2", "code-android-emulator__title", title);
	const closeButton = element("button", "code-android-emulator__close", "Close");
	closeButton.type = "button";
	header.append(heading, closeButton);

	const body = element("div", "code-android-emulator__body");
	const device = element("div", "code-android-emulator__device");
	const canvas = element("canvas", "code-android-emulator__canvas");
	canvas.width = 360;
	canvas.height = 640;
	canvas.setAttribute("aria-label", "Android WebGL graphics surface");
	const content = element("div", "code-android-emulator__content");
	content.setAttribute("aria-live", "polite");
	device.append(canvas, content);

	const inspector = element("aside", "code-android-emulator__inspector");
	const status = element(
		"p",
		"code-android-emulator__status",
		"Preparing Android runtime…"
	);
	status.setAttribute("role", "status");
	const report = element("pre", "code-android-emulator__report");
	report.tabIndex = 0;
	inspector.append(status, report);
	body.append(device, inspector);
	root.append(header, body);
	document.body.appendChild(root);

	closeButton.addEventListener("click", () => root.remove());
	closeButton.focus();

	return Object.freeze({
		canvas,
		closeButton,
		content,
		heading,
		report,
		root,
		status
	});
}

function element(tagName, className, text = "") {
	const node = document.createElement(tagName);
	node.className = className;
	if (text) node.textContent = text;
	return node;
}
