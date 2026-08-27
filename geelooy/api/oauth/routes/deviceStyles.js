// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visual garment for Awtsmoos.com OAuth device verification.
 * @description
 * The Awtsmoos is beyond color and form, yet the human consent vessel must make
 * the short code, client, scopes, and approve/deny choice unmistakably readable.
 */

function deviceStyles() {
	return `
body {
	margin: 0;
	min-height: 100vh;
	display: grid;
	place-items: center;
	background: radial-gradient(circle at top, #162745, #050712 48%);
	color: #f8fbff;
	font-family: system-ui, sans-serif;
}
main {
	width: min(720px, calc(100vw - 32px));
	padding: 32px;
	border: 1px solid #31506d;
	border-radius: 24px;
	background: #0d2037;
	box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
h1,
h2 {
	margin-top: 0;
}
p,
li {
	color: #bfd0e6;
	line-height: 1.55;
}
code,
.user-code {
	color: #9be8ff;
	word-break: break-word;
}
.user-code {
	font-size: clamp(30px, 7vw, 54px);
	font-weight: 900;
	letter-spacing: 0.08em;
}
input {
	width: 100%;
	padding: 14px 16px;
	border: 1px solid #4c6b8b;
	border-radius: 14px;
	background: #071426;
	color: #fff;
	font: inherit;
	font-size: 20px;
	text-transform: uppercase;
}
.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-top: 20px;
}
button {
	padding: 12px 20px;
	border: 0;
	border-radius: 999px;
	font: inherit;
	font-weight: 800;
	cursor: pointer;
}
button.approve {
	background: #7de7ff;
	color: #03131d;
}
button.deny {
	background: #392437;
	color: #ffd6ef;
}
.notice {
	padding: 14px;
	border-left: 4px solid #7de7ff;
	background: #101f36;
}
.error {
	border-left-color: #ff9bbf;
}
`;
}

module.exports = {
	deviceStyles
};
