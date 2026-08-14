// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookPrintCss
 * @description A restrained 6×9 publishing stylesheet whose largest type is exactly 18pt.
 */
function printCss(fontPt = 11.5) {
	const body = Math.max(9, Math.min(18, Number(fontPt) || 11.5));
	return `
@page {
	size: 6in 9in;
	margin: 0.66in 0.58in 0.72in;
	@bottom-center { content: counter(page); font-size: 9pt; }
}
* { box-sizing: border-box; }
html { background: #ece9e1; }
body {
	max-width: 6in;
	margin: 0 auto;
	background: white;
	color: #171512;
	font-family: Georgia, "Times New Roman", serif;
	font-size: ${body}pt;
	line-height: 1.52;
	text-rendering: optimizeLegibility;
}
main { padding: 0.7in 0.58in; }
h1, h2, h3 { line-height: 1.18; font-weight: 600; break-after: avoid; }
h1 { font-size: 18pt; margin: 0 0 18pt; }
h2 { font-size: 15pt; margin: 18pt 0 9pt; }
h3 { font-size: 12.5pt; margin: 14pt 0 7pt; }
p { margin: 0 0 0.72em; orphans: 3; widows: 3; }
a { color: inherit; text-decoration: none; }
.title-page { min-height: 7.4in; display: grid; place-content: center; text-align: center; break-after: page; }
.title-page .subtitle { font-size: 12pt; margin-top: 12pt; }
.front-matter { break-after: page; }
.toc { list-style: none; padding: 0; }
.toc li { margin: 0.28em 0; break-inside: avoid; }
.toc a { display: grid; grid-template-columns: 1fr auto; gap: 0.8em; }
.toc a::after { content: leader('.') target-counter(attr(href), page); }
.chapter { break-before: page; }
.chapter:first-of-type { break-before: auto; }
.chapter-meta { font-size: 9pt; letter-spacing: 0.02em; color: #5a554d; }
.verse { margin: 0 0 1em; break-inside: avoid-page; }
.original { direction: rtl; text-align: right; font-family: "Times New Roman", serif; }
.translation { direction: ltr; text-align: left; }
.bilingual-segment { margin: 0 0 1em; break-inside: avoid-page; }
.bilingual-segment .original { margin-bottom: 0.35em; }
.bilingual-segment .translation { padding-left: 0.7em; border-left: 1px solid #bbb5aa; }
.index, .missing-appendix { break-before: page; }
.index ol, .missing-appendix ul { padding-left: 1.4em; }
.source-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 8.5pt; overflow-wrap: anywhere; }
.notice { border: 1px solid #cfc8bb; padding: 0.7em 0.85em; margin: 1em 0; break-inside: avoid; }
sup, sub { font-size: 0.72em; }
@media print {
	html, body { background: white; max-width: none; margin: 0; }
	main { padding: 0; }
	a { color: black; }
}
@media screen {
	body { box-shadow: 0 0 24px rgba(0,0,0,.12); }
}
`;
}

module.exports = { printCss };
