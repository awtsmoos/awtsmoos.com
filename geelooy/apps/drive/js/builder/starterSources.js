//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StarterSources
 * @description
 * The Awtsmoos gives a blank folder its first honest words, then releases those words as ordinary source.
 * Awtsmoos.com makes starters disappear into editable HTML and CSS instead of trapping creation in template state.
 */

const STARTERS = Object.freeze({
	blank: { eyebrow: 'A new website', heading: 'Begin with real source.', detail: 'Open Code and make this page entirely your own.' },
	landing: { eyebrow: 'Welcome', heading: 'Make the next action obvious.', detail: 'Describe the promise, the proof, and the one thing your visitor should do next.' },
	portfolio: { eyebrow: 'Selected work', heading: 'Show what only you can make.', detail: 'Replace these words with projects, images, links, and the story behind your work.' },
	docs: { eyebrow: 'Documentation', heading: 'Explain the path clearly.', detail: 'Turn this page into guides, references, examples, and living technical notes.' }
});

export function createStarterSources(kind = 'blank', brief = {}) {
	const starter = STARTERS[kind] || STARTERS.blank;
	const name = htmlText(brief.name || 'My Awtsmoos Site');
	const purpose = htmlText(brief.purpose || starter.detail);
	return [
		{ path: 'index.html', mime: 'text/html; charset=utf-8', content: htmlDocument(name, purpose, starter) },
		{ path: 'styles.css', mime: 'text/css; charset=utf-8', content: starterStyles() }
	];
}

export function starterKinds() {
	return Object.keys(STARTERS);
}

function htmlDocument(name, purpose, starter) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${name}</title>
	<link rel="stylesheet" href="styles.css">
</head>
<body>
	<main class="page-shell">
		<p class="eyebrow">${htmlText(starter.eyebrow)}</p>
		<h1>${htmlText(starter.heading)}</h1>
		<p class="lede">${purpose}</p>
		<a class="action" href="#next">Shape the next section</a>
		<section id="next"><h2>${name}</h2><p>Edit this exact HTML in the Code pane.</p></section>
	</main>
</body>
</html>
`;
}

function starterStyles() {
	return `:root {
	font-family: Inter, ui-sans-serif, system-ui, sans-serif;
	color: #f7f7f2;
	background: #101112;
}
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top, #253046, #101112 55%); }
.page-shell { width: min(100% - 2rem, 68rem); margin: 0 auto; padding: clamp(4rem, 12vw, 9rem) 0; }
.eyebrow { letter-spacing: .16em; text-transform: uppercase; opacity: .68; }
h1 { max-width: 12ch; font-size: clamp(3rem, 10vw, 7rem); line-height: .94; margin: 1rem 0; }
.lede { max-width: 42rem; font-size: clamp(1.1rem, 3vw, 1.5rem); line-height: 1.6; }
.action { display: inline-block; margin: 2rem 0 6rem; padding: .9rem 1.2rem; border-radius: 999px; background: #fff; color: #111; text-decoration: none; }
#next { max-width: 42rem; padding-top: 3rem; border-top: 1px solid #ffffff2b; }
`;
}

function htmlText(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
