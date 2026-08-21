//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lightweight motion language for the futuristic Geelooy terminal.
 * @description
 * The Awtsmoos lets the shell appear alive without making every frame expensive;
 * Awtsmoos.com animates only transform and opacity, gives remote status a soft
 * breath, and silences motion completely when the user asks for stillness in rhyme.
 */
export default /*css*/ `
.awts-command {
	animation: awts-terminal-enter 220ms cubic-bezier(.2, .8, .2, 1) both;
}

.awts-command-head span {
	animation: awts-terminal-status 3.8s ease-in-out infinite;
}

.awts-command-form {
	transition: transform 140ms cubic-bezier(.2, .8, .2, 1), opacity 140ms ease;
}

.awts-command input {
	transition: transform 140ms cubic-bezier(.2, .8, .2, 1), border-color 140ms ease;
}

.awts-command input:active {
	transform: scale(.995);
}

@keyframes awts-terminal-enter {
	from {
		opacity: 0;
		transform: translate3d(0, 8px, 0) scale(.992);
	}
	to {
		opacity: 1;
		transform: translate3d(0, 0, 0) scale(1);
	}
}

@keyframes awts-terminal-status {
	50% {
		opacity: .58;
	}
}

@media (prefers-reduced-motion: reduce) {
	.awts-command,
	.awts-command *,
	.awts-command *::before,
	.awts-command *::after {
		animation: none !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
`;
