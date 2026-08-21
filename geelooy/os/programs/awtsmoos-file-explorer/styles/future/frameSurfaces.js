//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Static luminous surfaces and focus depth for the futuristic Explorer frame.
 * @description
 * The Awtsmoos lets light clothe stable geometry without forcing every frame to
 * repaint. Awtsmoos.com keeps gradients, borders, shadow, and desktop glass here,
 * while mobile policy may withdraw blur and leave the underlying truth in rhyme.
 */
export default /*css*/ `
.file-explorer {
	background:
		radial-gradient(circle at 12% 0, rgba(92, 246, 255, .15), transparent 30%),
		radial-gradient(circle at 92% 10%, rgba(82, 255, 184, .10), transparent 28%),
		linear-gradient(145deg, var(--awt-bg), var(--awt-bg2) 58%, #02060d);
}

.file-explorer::before {
	content: "";
	position: absolute;
	inset: 0;
	pointer-events: none;
	background: linear-gradient(120deg, rgba(255, 255, 255, .055), transparent 30%, rgba(92, 246, 255, .035) 66%, transparent);
	mix-blend-mode: screen;
}

.file-explorer-header,
.drive-shelf,
.selection-action-bar,
.path-bar-container,
.xp-status-strip {
	background: linear-gradient(180deg, rgba(17, 53, 88, .88), rgba(6, 21, 39, .88));
	border: 1px solid var(--awt-line);
	box-shadow: var(--awt-shadow), inset 0 1px rgba(255, 255, 255, .12);
	border-radius: var(--awt-radius);
	color: var(--awt-text);
}

.file-explorer-body {
	border: 1px solid var(--awt-line);
	border-radius: var(--awt-radius-lg);
	background: linear-gradient(180deg, rgba(255, 255, 255, .065), rgba(255, 255, 255, .025));
	box-shadow: inset 0 1px rgba(255, 255, 255, .08);
}

.file-explorer-body:focus-within {
	box-shadow: inset 0 1px rgba(255, 255, 255, .10), var(--awt-glow);
}

@media (hover: hover) and (pointer: fine) {
	.file-explorer-header,
	.drive-shelf,
	.selection-action-bar,
	.path-bar-container,
	.xp-status-strip {
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
	}
}

@media (min-width: 721px) {
	.file-explorer-frame {
		padding: 7px;
		gap: 7px;
	}

	.file-explorer-header {
		padding: 8px;
		gap: 8px;
	}

	.file-explorer-main {
		gap: 7px;
	}
}
`;
