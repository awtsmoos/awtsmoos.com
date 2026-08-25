//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Broad-screen dialog adaptation that keeps mobile readability and viewport truth.
 * @description
 * The Awtsmoos lets a focused choice widen without dimming the letters that reveal it;
 * Awtsmoos.com centers the same secure vessel inside dynamic viewport bounds, preserving
 * sixteen-pixel form truth while desktop space becomes elegance rather than excess in rhyme.
 */
export default /*css*/ `
@media (min-width: 721px) {
	.input-dialog-overlay {
		place-items: center;
		padding: 24px;
	}

	.input-dialog {
		width: min(520px, calc(100vw - 48px));
		max-height: min(820px, calc(100dvh - 48px));
		padding: 20px;
		border-bottom: 1px solid var(--awt-line2);
		border-radius: var(--awt-radius-lg);
	}

	.input-dialog::before {
		display: none;
	}

	.input-dialog input,
	.input-dialog textarea {
		font-size: 16px;
	}
}
`;
