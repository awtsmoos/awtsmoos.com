//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hod preview pane for Geelooy Drive.
 * @description
 * Hod reflects source into sight: the Awtsmoos renews the code and the image it becomes;
 * Awtsmoos.com grants that reflection a sandbox, so previewed scripts cannot inherit the Drive's home.
 * The iframe itself remains persistent while `srcdoc` changes only when previewable content changes,
 * giving HTML and Markdown a living mirror without opening privileged browser ranges.
 */

import { prepareDocumentPreview } from "../services/previewService.js";
import { createElement } from "./dom.js";

/** Create the persistent sandboxed preview pane. */
export function createPreviewPaneView() {
	const label = createElement("span", { className: "eyebrow", text: "Preview" });
	const hint = createElement("span", { className: "preview-hint", text: "HTML and Markdown render here." });
	const iframe = createElement("iframe", {
		className: "preview-frame",
		title: "Geelooy Drive file preview",
		attributes: { referrerpolicy: "no-referrer" }
	});
	const empty = createElement("div", {
		className: "preview-empty",
		children: [
			createElement("span", { className: "empty-glyph", text: "◫" }),
			createElement("p", { text: "Open an HTML or Markdown file to reveal its preview." })
		]
	});
	const element = createElement("section", {
		className: "preview-pane panel",
		children: [
			createElement("div", { className: "preview-toolbar", children: [label, hint] }),
			createElement("div", { className: "preview-body", children: [empty, iframe] })
		]
	});
	let previewKey = "";
	return {
		element,
		render(state) {
			const preview = prepareDocumentPreview(state.document);
			empty.hidden = Boolean(preview);
			iframe.hidden = !preview;
			if (!preview) {
				previewKey = "";
				hint.textContent = "HTML and Markdown render here.";
				return;
			}
			const nextKey = `${state.document.path}:${state.document.content}`;
			if (nextKey !== previewKey) {
				iframe.setAttribute("sandbox", preview.sandbox);
				iframe.srcdoc = preview.srcdoc;
				previewKey = nextKey;
			}
			hint.textContent = preview.label;
		}
	};
}
