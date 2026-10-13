//B"H
//Boruch Hashem
//Blessed be He

/**
	* @module InitialContentRenderer
	* @description
	* The Awtsmoos renders meaningful Torah before interactive Reader JavaScript
	* arrives. Canonical Hebrew sections receive stable pasuk addresses while
	* ordinary teachings remain unnumbered, escaped, and immediately readable.
	*/

const {
	collectReadableText,
	escapeHtml,
	toPlainText
} = require("./InitialContentText.js");

/**
	* Turns normalized prose into safe semantic paragraphs.
	* @param {string} text Normalized body text.
	* @returns {string} Paragraph markup.
	*/
function renderParagraphs(text) {
	return String(text || "").split(/\n{2,}/).map(paragraph => {
		const safeParagraph = escapeHtml(paragraph.trim()).replace(/\n/g, "<br>");
		return safeParagraph ? `<p>${safeParagraph}</p>` : "";
	}).filter(Boolean).join("\n");
}
/**
	* Renders one canonical Hebrew section with a stable deep-link identity.
	* @param {*} section Source section vessel.
	* @param {number} index Zero-based section index.
	* @param {number} chapter Canonical source chapter.
	* @returns {string} One pasuk section or an empty string.
	*/
function renderPasuk(section, index, chapter) {
	const number = index + 1;
	const text = collectReadableText(section);
	if (!text) {
		return "";
	}
	const anchor = `pasuk-${number}`;
	return `<section class="awtsmoos-initial-pasuk awtsmoos-reader-section"`
		+ ` id="${anchor}" data-awtsmoos-pasuk data-pasuk="${number}"`
		+ ` data-source-chapter="${chapter}" dir="rtl">`
		+ `<a class="awtsmoos-verse-number" href="#${anchor}"`
		+ ` aria-label="Pasuk ${number}">${number}</a>`
		+ `<p class="awtsmoos-initial-pasuk-text">`
		+ `${escapeHtml(text).replace(/\n/g, "<br>")}</p></section>`;
}

/**
	* Renders canonical sections only when storage metadata proves their identity.
	* @param {*} sections Candidate section list.
	* @param {*} meta Source metadata.
	* @returns {string} Canonical pasuk markup or an empty string.
	*/function renderCanonicalSections(sections, meta) {
	if (!Array.isArray(sections) || meta?.canonicalHebrew !== true) {
		return "";
	}
	const chapter = Number(meta.sourceChapter) || 0;
	return sections.map((section, index) => {
		return renderPasuk(section, index, chapter);
	}).filter(Boolean).join("\n");
}

/**
	* Provides a truthful stable failure vessel when a public teaching is absent.
	* @returns {string} Missing-teaching markup.
	*/
function renderMissingPost() {
	return `<article class="awtsmoos-initial-post awtsmoos-initial-post-missing"`
		+ ` data-awtsmoos-initial-post dir="auto">`
		+ `<h1>Torah teaching unavailable</h1>`
		+ `<p>This public teaching could not be resolved.</p></article>`;
}

/**
	* Renders the complete server-first public Reader body.
	* B"H — the body recovery chain tries every vessel a post can carry its
	* text in (flat content, body/text/sections fields, or the whole dayuh
	* map). When nothing is recoverable the article keeps an honest empty
	* vessel marked data-awtsmoos-awaiting-text so client hydration can fill
	* it — it never prints a permanent "preparing" promise as if loading were
	* still in progress.
	* @param {object} context Resolved post, Heichel, and author alias vessels.
	* @returns {string} Safe meaningful HTML available before client hydration.
	*/
function renderInitialContent({ post, heichel = {}, alias = {} }) {
	if (!post || typeof post !== "object") {
		return renderMissingPost();
	}
	const dayuh = post.dayuh && typeof post.dayuh === "object" ? post.dayuh : {};
	const structuredMarkup = renderCanonicalSections(dayuh.sections, dayuh.meta || {});
	const bodySource = post.content || post.body || post.text || post.sections
		|| dayuh.content || dayuh;
	const body = structuredMarkup ? "" : collectReadableText(bodySource);
	const title = toPlainText(post.title) || "Torah Revelation";
	const heichelName = toPlainText(heichel.name || heichel.title);
	const authorName = toPlainText(alias.name || alias.aliasId);
	const contextText = [heichelName, authorName ? `By ${authorName}` : ""]
		.filter(Boolean)
		.join(" · ");
	const bodyMarkup = structuredMarkup || renderParagraphs(body);
	const awaitingText = bodyMarkup
		? ""
		: ` data-awtsmoos-awaiting-text="true"`;
	const enhancementStatus = bodyMarkup
		? `<p class="awtsmoos-reader-enhancement-status" role="status">`
			+ `Interactive reader tools are loading; the Torah text above is ready now.`
			+ `</p>`
		: "";
	return `<article class="awtsmoos-initial-post" data-awtsmoos-initial-post${awaitingText} dir="auto">`
		+ (contextText ? `<p class="awtsmoos-initial-post-context">${escapeHtml(contextText)}</p>` : "")
		+ `<h1>${escapeHtml(title)}</h1>`
		+ `<div class="awtsmoos-initial-post-body">${bodyMarkup}</div>`
		+ enhancementStatus
		+ `</article>`;
}

module.exports = {
	renderCanonicalSections,
	renderInitialContent,
	renderParagraphs
};
