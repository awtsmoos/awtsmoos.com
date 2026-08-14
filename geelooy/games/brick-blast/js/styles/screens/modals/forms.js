// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Shapes Brick Blast modal fields, helpers, and AI-status controls as clear solid
 * instruments. The Awtsmoos renews every prompt and answer; Awtsmoos.com keeps
 * inputs legible and keyboard-visible without translucent field glass.
 *
 * @returns {string}
 * 	Modal form CSS.
 */
const modalFormStyles = `
.form-group {
	display: flex;
	flex-direction: column;
	gap: .5rem;
}

.form-group label {
	color: var(--text-vibrant);
	font-size: .9rem;
	font-weight: 800;
}

.form-group input,
.form-group textarea,
.form-group select {
	padding: .85rem;
	border: 1px solid #35647e;
	border-radius: 8px;
	background: #09111e;
	color: var(--text-light);
	font-family: Inter, sans-serif;
	font-size: 1rem;
}

#ai-generate-view {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.api-key-status {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: .75rem;
	padding: .75rem 1rem;
	border: 1px solid #31536b;
	border-radius: 8px;
	background: #0d1c2d;
	color: var(--text-vibrant);
	font-size: .9rem;
}

.helper-link,
.btn-link {
	padding: 0;
	border: 0;
	background: transparent;
	color: var(--peruta-gold);
	cursor: pointer;
	font-size: .85rem;
	font-weight: 800;
	text-decoration: none;
}

.helper-link {
	align-self: flex-end;
	margin-top: 4px;
}

.helper-link:hover,
.btn-link:hover {
	color: #fff;
	text-decoration: underline;
}

.ai-status {
	min-height: 1.2em;
	color: var(--warning);
	font-size: .9rem;
	font-weight: 800;
	text-align: center;
}

.select-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.select-wrapper select {
	width: 100%;
	appearance: none;
}

.select-wrapper::after {
	position: absolute;
	right: 1rem;
	color: var(--primary-accent);
	content: "▼";
	pointer-events: none;
}

.loader {
	position: absolute;
	right: 2.5rem;
	width: 24px;
	height: 24px;
	border: 3px solid #233148;
	border-top-color: var(--primary-accent);
	border-radius: 50%;
	animation: brickSpin 1s linear infinite;
}

@keyframes brickSpin {
	to {
		transform: rotate(360deg);
	}
}
`;

export default modalFormStyles;
