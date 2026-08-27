// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visual garment for the Awtsmoos.com OAuth approval gate.
 * @description
 * The Awtsmoos is beyond color and measure, yet the consent vessel should be
 * calm, legible, and spacious; no compressed line should hide what the user grants.
 */

function authorizeStyles() {
	return `
body {
	margin: 0;
	min-height: 100vh;
	display: grid;
	place-items: center;
	background: #071426;
	color: #f7faff;
	font-family: system-ui, sans-serif;
}
main {
	width: min(720px, calc(100vw - 32px));
	padding: 32px;
	border: 1px solid rgba(125, 231, 255, 0.25);
	border-radius: 24px;
	background: #0d2037;
	box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
p {
	color: #b9cbe2;
	line-height: 1.55;
}
a.button {
	display: inline-flex;
	padding: 12px 20px;
	border-radius: 999px;
	background: linear-gradient(135deg, #7de7ff, #41bcff);
	color: #03131d;
	font-weight: 800;
	text-decoration: none;
}
pre {
	white-space: pre-wrap;
	word-break: break-word;
}
`;
}

module.exports = {
	authorizeStyles
};
