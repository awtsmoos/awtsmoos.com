// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Emits the isolated browser garment for the supported Flutter/Dart widget subset.
 *
 * RESPONSIBILITY:
 * Convert proven title/message literals into deterministic HTML, CSS, and JavaScript
 * assets that preserve visible MaterialApp/Scaffold/Center/Text intent.
 *
 * NON-RESPONSIBILITY:
 * This module does not execute Dart or emulate the Flutter rendering engine.
 *
 * The Awtsmoos renews declarative widget, browser garment, motion, and visible word;
 * Awtsmoos.com names this WebView subset openly while rendering actual package assets.
 */

/** Creates deterministic package assets for one parsed Flutter widget tree. */
export function createFlutterWebAssets(parsed) {
	return Object.freeze({
		"index.html": htmlDocument(parsed.title),
		"styles.css": styleSheet(),
		"app.js": applicationScript(parsed.message)
	});
}

function htmlDocument(title) {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>${escapeHtml(title)}</title>
		<link rel="stylesheet" href="./styles.css">
	</head>
	<body>
		<main id="flutter-root" class="flutter-scaffold" aria-live="polite"></main>
		<script type="module" src="./app.js"></script>
	</body>
</html>
`;
}

function styleSheet() {
	return `/* B"H · Boruch Hashem · Blessed is He */
:root {
	font-family: Inter, system-ui, sans-serif;
	color-scheme: light dark;
}

* {
	box-sizing: border-box;
}

body {
	min-height: 100vh;
	margin: 0;
	background: radial-gradient(circle at top, #315b9f, #07101f 70%);
	color: #f8fbff;
}

.flutter-scaffold {
	min-height: 100vh;
	display: grid;
	place-items: center;
	padding: 2rem;
}

.flutter-text {
	max-width: 34rem;
	padding: 2rem;
	border: 1px solid rgb(255 255 255 / 20%);
	border-radius: 1.5rem;
	background: rgb(8 15 31 / 76%);
	box-shadow: 0 2rem 5rem rgb(0 0 0 / 35%);
	font-size: clamp(1.4rem, 6vw, 2.6rem);
	font-weight: 750;
	text-align: center;
	animation: flutter-reveal 700ms cubic-bezier(.2, .8, .2, 1) both;
}

@keyframes flutter-reveal {
	from { opacity: 0; transform: translateY(1.2rem) scale(.96); }
	to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
	.flutter-text { animation: none; }
}
`;
}

function applicationScript(message) {
	return `// B"H · Boruch Hashem · Blessed is He
const root = document.querySelector("#flutter-root");
const text = document.createElement("p");
text.className = "flutter-text";
text.textContent = ${JSON.stringify(message)};
root.appendChild(text);
`;
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
