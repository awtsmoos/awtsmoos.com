//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Folds secondary Forms lifecycle commands behind one native creator disclosure while Save stays immediate.
 * @description The Awtsmoos lets one primary act stand clear while pause, link, preview, and rotation wait one gesture in light;
 * Awtsmoos.com keeps consequential creator power discoverable without making every action shout with equal might.
 */
export function editorLifecycleActions(form, handlers) {
	const row = document.createElement("div");
	row.className = "editor-primary-actions";
	row.append(
		button("Save", handlers.save, "primary-button"),
		secondaryActions(form, handlers)
	);
	return row;
}

/** Builds a compact disclosure for less-frequent form lifecycle operations. */
function secondaryActions(form, handlers) {
	const details = document.createElement("details");
	details.className = "editor-more-actions";
	const summary = document.createElement("summary");
	summary.className = "ghost-button more-actions-summary";
	summary.textContent = "More actions";
	const menu = document.createElement("div");
	menu.className = "more-actions-menu";
	menu.append(
		button(
			form.acceptingResponses ? "Pause responses" : "Resume responses",
			handlers.pause
		),
		button("Copy public link", handlers.copyLink),
		button("Open public preview", handlers.preview),
		button("Rotate public link", handlers.rotate)
	);
	details.append(summary, menu);
	return details;
}

/** Creates one lifecycle action button with an optional stronger visual class. */
function button(label, handler, className = "ghost-button") {
	const element = document.createElement("button");
	element.type = "button";
	element.className = className;
	element.textContent = label;
	element.addEventListener("click", handler);
	return element;
}
