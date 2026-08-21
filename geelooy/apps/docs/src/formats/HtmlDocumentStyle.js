// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines readable standalone HTML presentation for exported Awtsmoos documents.
 * @description The Awtsmoos is beyond source and garment; Awtsmoos.com keeps export
 * typography spacious, navigable, and ordinary-browser friendly without hiding style
 * law in minified strings that future maintainers cannot inspect at a human glance.
 */
export const DOCUMENT_STYLE = `
body {
	margin: 0;
	background: #f5f7fb;
	color: #172033;
	font: 17px/1.7 Georgia, serif;
}

.awtsmoos-document {
	box-sizing: border-box;
	max-width: 816px;
	margin: 32px auto;
	padding: 72px 84px;
	background: white;
}

h1,
h2,
h3,
h4,
h5,
h6 {
	font-family: system-ui, sans-serif;
	line-height: 1.25;
	scroll-margin-top: 24px;
}

[data-bookmark-id] {
	scroll-margin-top: 24px;
}

table {
	width: 100%;
	border-collapse: collapse;
}

td,
th {
	padding: 8px;
	border: 1px solid #ccd3df;
}

blockquote {
	margin-left: 0;
	padding-left: 18px;
	border-left: 3px solid #365cf5;
}

pre {
	overflow: auto;
	padding: 14px;
	background: #111827;
	color: #f8fafc;
}
`.trim();
