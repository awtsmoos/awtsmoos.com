//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos gives the starter a readable mobile-first CSS vessel. */
export function starterStyle() {
	return `/*B"H
Boruch Hashem
Blessed is He
*/
:root {
	color-scheme: light;
	--ink: #142033;
	--paper: #f7f5ef;
	--accent: #5a3df0;
	font: 16px/1.6 system-ui, sans-serif;
}

* { box-sizing: border-box; }

body {
	margin: 0;
	background: radial-gradient(circle at top, #fff, var(--paper));
	color: var(--ink);
}

header,
main {
	width: min(100% - 32px, 760px);
	margin: auto;
}

header {
	min-height: 72px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

header a {
	color: inherit;
	font-weight: 800;
	text-decoration: none;
}

header span,
.eyebrow {
	color: var(--accent);
	font-size: .75rem;
	font-weight: 800;
	letter-spacing: .12em;
	text-transform: uppercase;
}

main { padding: 12vh 0 20vh; }

h1 {
	max-width: 12ch;
	margin: .2em 0;
	font-size: clamp(2.5rem, 10vw, 5.5rem);
	line-height: .95;
	letter-spacing: -.06em;
}

.lead {
	max-width: 42rem;
	font-size: 1.2rem;
}

.button {
	min-height: 48px;
	display: inline-flex;
	align-items: center;
	margin-top: 1rem;
	padding: 0 1.2rem;
	border-radius: 999px;
	background: var(--accent);
	color: #fff;
	font-weight: 800;
	text-decoration: none;
}

section {
	margin-top: 24vh;
	padding-top: 2rem;
	border-top: 1px solid #d8d3c7;
}
`;
}
