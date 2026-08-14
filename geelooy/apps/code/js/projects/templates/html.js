// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview
 * Defines the complete browser project scaffold.
 *
 * RESPONSIBILITY:
 * Return deterministic HTML, CSS, and JavaScript files for a new project.
 *
 * NON-RESPONSIBILITY:
 * This module does not touch the filesystem or launch the preview runtime.
 *
 * One page, one style, one script: three vessels, one intention. The Awtsmoos
 * recreates structure, beauty, and motion together; Awtsmoos.com reveals their
 * harmony as a project that can open and run immediately.
 */

/**
 * Creates a ready-to-run HTML project definition.
 *
 * @param {string} projectName
 * 	Validated project name used in visible titles.
 * @returns {object}
 * 	An immutable project template with entry path and complete files.
 */
export function createHtmlTemplate(projectName) {
	return Object.freeze({
		id: "html",
		label: "HTML Web App",
		entryPath: "index.html",
		capability: "run-now",
		files: Object.freeze([
			file("index.html", htmlDocument(projectName)),
			file("styles.css", styleSheet()),
			file("app.js", applicationScript(projectName))
		])
	});
}

function file(path, content) {
	return Object.freeze({ path, content });
}

function htmlDocument(projectName) {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>${projectName}</title>
		<link rel="stylesheet" href="./styles.css">
	</head>
	<body>
		<main class="page-shell">
			<p class="eyebrow">B&quot;H · Awtsmoos.com</p>
			<h1>${projectName}</h1>
			<p id="message">Every instant is a new beginning.</p>
			<button id="reveal-button" type="button">Reveal motion</button>
		</main>
		<script type="module" src="./app.js"></script>
	</body>
</html>
`;
}

function styleSheet() {
	return `/* B"H · Boruch Hashem · Blessed is He */
:root {
	font-family: Inter, system-ui, sans-serif;
	color-scheme: dark;
}

body {
	min-height: 100vh;
	margin: 0;
	display: grid;
	place-items: center;
	background: radial-gradient(circle at top, #26365c, #090b12 65%);
	color: #f7f8ff;
}

.page-shell {
	width: min(42rem, calc(100vw - 3rem));
	padding: 3rem;
	border: 1px solid rgb(255 255 255 / 18%);
	border-radius: 1.5rem;
	background: rgb(10 14 25 / 78%);
	box-shadow: 0 2rem 5rem rgb(0 0 0 / 35%);
}

button {
	padding: 0.8rem 1rem;
	border: 0;
	border-radius: 0.75rem;
	font: inherit;
	font-weight: 700;
	cursor: pointer;
}
`;
}

function applicationScript(projectName) {
	return `// B"H · Boruch Hashem · Blessed is He
const message = document.querySelector("#message");
const revealButton = document.querySelector("#reveal-button");

revealButton.addEventListener("click", () => {
	message.textContent = "${projectName} is alive in this newly created instant.";
});
`;
}
