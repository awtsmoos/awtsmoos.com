//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Renders semantic evidence as ordinary readable documentation.
 * The Awtsmoos may be revealed through words without turning words into hidden law;
 * Awtsmoos.com keeps every source-derived name escaped and every claim attached to what we saw.
 */

/** Escapes text before it enters the Human View HTML projection. */
export function escapeHumanViewHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('\"', "&quot;")
		.replaceAll("'", "&#039;");
}

/** Renders one source-linked evidence list. */
function renderFacts(title, facts, emptyText) {
	const rows = facts.length
		? facts.map((item) => `
			<button class="human-view-fact" data-human-source data-start="${item.start}" data-end="${item.end}">
				<span class="human-view-fact-name">${escapeHumanViewHtml(item.name)}</span>
				<span class="human-view-fact-detail">${escapeHumanViewHtml(item.detail)} · line ${item.line}</span>
			</button>`).join("")
		: `<p class="human-view-empty-copy">${escapeHumanViewHtml(emptyText)}</p>`;

	return `<section class="human-view-card"><h3>${escapeHumanViewHtml(title)}</h3><div class="human-view-facts">${rows}</div></section>`;
}

/** Renders a loading document that is safe to show before parser modules load. */
export function renderHumanViewLoading(file) {
	return `<div class="human-view-state human-view-loading" role="status">
		<div class="human-view-spinner" aria-hidden="true"></div>
		<h3>Reading ${escapeHumanViewHtml(file?.name || "active file")}</h3>
		<p>The styled shell is ready. Merkava analysis is scheduled after this paint.</p>
	</div>`;
}

/** Renders a complete evidence-backed Human View document. */
export function renderHumanViewDocument(documentModel) {
	const identity = documentModel.identity;
	return `<article class="human-view-document">
		<section class="human-view-card human-view-purpose">
			<span class="human-view-badge">Purpose unresolved</span>
			<h2>${escapeHumanViewHtml(identity.name)}</h2>
			<p>${escapeHumanViewHtml(documentModel.purpose.text)}</p>
			<small>${escapeHumanViewHtml(identity.path)}</small>
		</section>
		<section class="human-view-summary">
			<span>${documentModel.metrics.imports} dependencies</span>
			<span>${documentModel.metrics.exports} exports</span>
			<span>${documentModel.metrics.declarations} declarations</span>
			<span>Evidence: ${escapeHumanViewHtml(documentModel.provenance.parser)}</span>
		</section>
		${renderFacts("Dependencies", documentModel.imports, "No static imports observed.")}
		${renderFacts("Public surface", documentModel.exports, "No explicit exports observed.")}
		${renderFacts("Top-level structure", documentModel.declarations, "No supported top-level declarations observed.")}
	</article>`;
}

/** Renders a bounded unsupported-language state without inventing semantics. */
export function renderHumanViewUnsupported(file) {
	return `<div class="human-view-state human-view-empty"><h3>No adapter yet</h3><p>${escapeHumanViewHtml(file?.name || "This file")} is preserved exactly, but this first slice only reads JavaScript-family source through Merkava.</p></div>`;
}

/** Renders a visible, styled analysis failure. */
export function renderHumanViewError(error) {
	return `<div class="human-view-state human-view-error" role="alert"><h3>Human View could not read this source</h3><p>${escapeHumanViewHtml(error?.message || error || "Unknown analysis error")}</p></div>`;
}
