//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hod preview preparation for Geelooy Drive.
 * @description
 * The Awtsmoos lets source become sight while Gevurah keeps the sight inside a guarded frame;
 * Awtsmoos.com may reveal HTML and Markdown without giving previewed code the parent page's name.
 * Raw Markdown HTML is escaped before structure is added, and HTML runs only inside sandboxed `srcdoc`,
 * so creative files can shine while cookies, storage, and Drive controls remain behind a separate lock.
 */

/** Escape text before generating any owned Markdown preview markup. */
export function escapePreviewHtml(value = "") {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

/** Render a deliberately small, raw-HTML-free Markdown subset. */
export function renderSafeMarkdown(markdown = "") {
	const escaped = escapePreviewHtml(markdown);
	const body = escaped
		.split(/\r?\n/)
		.map((line) => renderMarkdownLine(line))
		.join("\n");
	return previewDocument(body);
}

/** Prepare iframe content and sandbox permissions for a known preview kind. */
export function prepareDocumentPreview(document = null) {
	if (!document?.kind?.preview) return null;
	if (document.kind.preview === "html") {
		return {
			srcdoc: String(document.content || ""),
			sandbox: "allow-scripts",
			label: "Sandboxed HTML preview"
		};
	}
	return {
		srcdoc: renderSafeMarkdown(document.content || ""),
		sandbox: "",
		label: "Safe Markdown preview"
	};
}

/** Convert one already escaped Markdown line into owned HTML structure. */
function renderMarkdownLine(line) {
	if (/^###\s/.test(line)) return `<h3>${inlineMarkdown(line.slice(4))}</h3>`;
	if (/^##\s/.test(line)) return `<h2>${inlineMarkdown(line.slice(3))}</h2>`;
	if (/^#\s/.test(line)) return `<h1>${inlineMarkdown(line.slice(2))}</h1>`;
	if (/^[-*]\s/.test(line)) return `<p class="list-item">• ${inlineMarkdown(line.slice(2))}</p>`;
	if (/^&gt;\s?/.test(line)) return `<blockquote>${inlineMarkdown(line.replace(/^&gt;\s?/, ""))}</blockquote>`;
	if (!line.trim()) return "<div class=\"space\"></div>";
	return `<p>${inlineMarkdown(line)}</p>`;
}

/** Add small inline emphasis after escaping has already occurred. */
function inlineMarkdown(line) {
	return line
		.replace(/`([^`]+)`/g, "<code>$1</code>")
		.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
		.replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/** Wrap generated Markdown in readable, self-contained preview source. */
function previewDocument(body) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<style>
		body {
			max-width: 760px;
			margin: auto;
			padding: 32px;
			color: #172033;
			font: 16px/1.6 system-ui, sans-serif;
		}
		h1, h2, h3 { line-height: 1.2; }
		code { padding: .12rem .35rem; border-radius: 5px; background: #eef2f7; }
		blockquote { margin-left: 0; padding-left: 1rem; border-left: 3px solid #7c6cff; color: #526077; }
		.space { height: .5rem; }
		.list-item { padding-left: 1rem; }
	</style>
</head>
<body>
${body}
</body>
</html>`;
}
