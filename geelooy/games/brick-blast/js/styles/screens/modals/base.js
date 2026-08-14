// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Gives Brick Blast confirmations and creation dialogs one solid focus chamber.
 * The Awtsmoos renews question, answer, and consequence; Awtsmoos.com dims the
 * board for attention without blurring it into glass behind the player's choice.
 *
 * @returns {string}
 * 	Core modal and action CSS.
 */
const modalBaseStyles = `
.modal-backdrop {
	position: absolute;
	inset: 0;
	z-index: 2000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1rem;
	background: rgba(2, 5, 12, .92);
}

.modal-content {
	display: flex;
	width: min(90%, 380px);
	flex-direction: column;
	gap: 1.5rem;
	padding: 2.2rem 1.6rem;
	border: 2px solid var(--primary-accent);
	border-radius: 14px;
	background: #0c1320;
	box-shadow: 0 26px 72px rgba(0, 0, 0, .62);
}

.modal-content h3 {
	margin: 0;
	font-size: 1.75rem;
	font-weight: 900;
	text-align: center;
}

.modal-content p {
	margin: -.5rem 0 0;
	color: #fff;
	font-size: 1rem;
	font-weight: 500;
	line-height: 1.5;
	text-align: center;
}

.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: .75rem;
	margin-top: .5rem;
}

.btn-icon {
	display: grid;
	width: 44px;
	height: 44px;
	place-items: center;
	border: 1px solid #33445a;
	border-radius: 50%;
	background: #172238;
	color: var(--text-light);
	cursor: pointer;
	font-size: 1.5rem;
	transition: background-color .2s, border-color .2s, transform .2s;
}

.btn-icon:hover {
	border-color: var(--primary-accent);
	background: var(--primary-accent);
	color: var(--text-dark);
	transform: translateY(-1px);
}

.modal-content :where(button, input, textarea, select, a):focus-visible {
	outline: 3px solid var(--primary-accent);
	outline-offset: 2px;
}
`;

export default modalBaseStyles;
