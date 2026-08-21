//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mobile-first visual vessel for the futuristic Geelooy Awtsmoos terminal.
 * @description
 * The Awtsmoos lets luminous letters inhabit a calm night-world where thumb and
 * keyboard both belong. Awtsmoos.com keeps output readable, input generous, and
 * remote connection state visible without costly animated paint, all in rhyme.
 */
export default /*css*/ `
.awts-command {
	height: 100%;
	min-height: 0;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
	background:
		radial-gradient(circle at 18% 0, rgba(92, 246, 255, .14), transparent 32%),
		radial-gradient(circle at 88% 12%, rgba(82, 255, 184, .08), transparent 28%),
		linear-gradient(180deg, #06111f, #020509);
	color: #c7ffdd;
	font: 12px "SFMono-Regular", "Cascadia Code", Consolas, monospace;
}

.awts-command-head {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 9px 11px;
	border-bottom: 1px solid rgba(92, 246, 255, .26);
	background: rgba(10, 33, 64, .78);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	color: #effcff;
	font-family: Inter, Tahoma, system-ui, sans-serif;
}

.awts-command-head b {
	font-size: 13px;
	letter-spacing: .02em;
}

.awts-command-head span {
	color: #83ffd0;
	font-size: 9px;
	text-transform: uppercase;
	letter-spacing: .12em;
	white-space: nowrap;
}

.awts-command-output {
	flex: 1 1 auto;
	min-height: 0;
	overflow: auto;
	padding: 11px;
	white-space: pre-wrap;
	word-break: break-word;
	background: rgba(0, 0, 0, .38);
	overscroll-behavior: contain;
	-webkit-overflow-scrolling: touch;
	contain: layout paint;
}

.awts-command-form {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 8px;
	padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
	border-top: 1px solid rgba(92, 246, 255, .22);
	background: rgba(6, 17, 31, .94);
}

.awts-command-prompt {
	color: #52ffb8;
	font-weight: 900;
	text-shadow: 0 0 10px rgba(82, 255, 184, .38);
}

.awts-command input {
	flex: 1;
	min-width: 0;
	min-height: 46px;
	padding: 10px 12px;
	border: 1px solid rgba(92, 246, 255, .42);
	border-radius: 14px;
	background: rgba(0, 0, 0, .68);
	color: #d8ffe8;
	font: 16px inherit;
	outline: none;
}

.awts-command input:focus {
	border-color: rgba(92, 246, 255, .76);
	box-shadow: 0 0 0 3px rgba(92, 246, 255, .11);
}

.cmd-error { color: #ff8aa8; }
.cmd-success { color: #8affc8; }
.cmd-muted { color: #8aa1ad; }
.cmd-info { color: #9be8ff; }

@media (min-width: 721px) {
	.awts-command {
		font-size: 13px;
	}

	.awts-command-head {
		padding: 10px 13px;
	}

	.awts-command-output {
		padding: 14px;
	}

	.awts-command-form {
		padding: 10px;
	}

	.awts-command input {
		min-height: 42px;
		font-size: 13px;
	}
}
`;
