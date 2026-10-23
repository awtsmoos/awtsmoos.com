//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Supplies escaped fragments for Human Takeover states and source labels.
 * The Awtsmoos gives every finite word a vessel, while unescaped source must never become authority over UI;
 * Awtsmoos.com therefore renders observed text only after it has been made safe for the human surface.
 */

/** Escapes source-derived text before it enters Human Takeover HTML. */
export function escapeHuman(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

/** Returns a readable source-line label from one evidence object. */
export function sourceLineLabel(source) {
	return Number.isFinite(source?.line) ? `Line ${source.line}` : "Exact source";
}

/** Renders the semantic loading state while analysis remains deferred from first paint. */
export function loadingTemplate(file = {}) {
	return `
		<section class="human-state human-state-loading" aria-live="polite">
			<div class="human-orbit" aria-hidden="true"></div>
			<p class="human-eyebrow">Reading observed reality</p>
			<h2>Mapping ${escapeHuman(file.name || "active source")}</h2>
			<p>Building a source-linked semantic document without inventing intent.</p>
		</section>`;
}

/** Renders one unsupported-source explanation. */
export function unsupportedTemplate(message) {
	return `<section class="human-state"><p class="human-eyebrow">Not mapped yet</p><h2>Human Takeover cannot open this source yet.</h2><p>${escapeHuman(message)}</p></section>`;
}

/** Renders one analysis or materialization failure without exposing unsafe HTML. */
export function errorTemplate(message) {
	return `<section class="human-state human-state-error"><p class="human-eyebrow">Evidence interrupted</p><h2>Human Takeover stopped safely.</h2><p>${escapeHuman(message)}</p></section>`;
}
