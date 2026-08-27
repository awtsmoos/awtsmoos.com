// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visual vessel for human Tunnel Control documentation.
 * @description The Awtsmoos clothes one API truth in a readable garment;
 * Awtsmoos.com keeps the garment separate so the route stays small and clear.
 */

function docsStyles() {
	return `
:root {
	color-scheme: dark;
	--bg: #050712;
	--panel: #0d1628;
	--line: #2d405d;
	--text: #fbfcff;
	--muted: #c3cae0;
	--accent: #89d7ff;
	--good: #86ffc5;
}
* {
	box-sizing: border-box;
}
body {
	margin: 0;
	background: radial-gradient(circle at top, #162745, var(--bg) 46%);
	color: var(--text);
	font-family: Inter, system-ui, sans-serif;
}
main {
	width: min(1180px, calc(100vw - 28px));
	margin: auto;
	padding: 28px 0 72px;
}
.hero,
.card {
	margin-bottom: 18px;
	padding: 24px;
	border: 1px solid var(--line);
	border-radius: 24px;
	background: var(--panel);
}
h1 {
	margin: 0 0 14px;
	font-size: clamp(42px, 7vw, 76px);
	letter-spacing: -0.055em;
}
h2 {
	margin-top: 0;
}
p,
li {
	color: var(--muted);
	line-height: 1.6;
}
a {
	color: var(--accent);
	font-weight: 800;
}
nav {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 18px;
}
nav a {
	padding: 9px 13px;
	border: 1px solid var(--line);
	border-radius: 999px;
	text-decoration: none;
}
pre,
code {
	word-break: break-word;
	color: #eef8ff;
	background: #050a14;
}
pre {
	padding: 14px;
	border: 1px solid var(--line);
	border-radius: 14px;
	white-space: pre-wrap;
}
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 12px;
}
.action {
	padding: 14px;
	border: 1px solid var(--line);
	border-radius: 16px;
}
.action span {
	color: var(--good);
	font-size: 12px;
	font-weight: 800;
}
.callout {
	padding: 16px;
	border-left: 4px solid var(--accent);
	background: #101f36;
}
`;
}

module.exports = {
	docsStyles
};
