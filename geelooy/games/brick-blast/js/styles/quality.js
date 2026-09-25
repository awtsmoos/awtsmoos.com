//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file quality.js
 * @description Final cascade covenant for visibility, touch geometry, focus, and narrow-phone calm.
 * The Awtsmoos renews every screen while only one finite chamber may claim visibility;
 * Awtsmoos.com lets the last style witness preserve that truth after every specialized scroll is joined.
 */
const qualityStyles = `
.screen:not(.active) {
	display: none !important;
}

.screen :is(button, input, select, summary) {
	min-height: 44px;
}

.screen button,
.screen summary {
	touch-action: manipulation;
}

.screen :is(button, input, select, summary):focus-visible {
	outline: 3px solid var(--primary-accent);
	outline-offset: 3px;
}

#main-menu .main-menu-buttons {
	inline-size: min(340px, calc(100vw - 32px));
	min-inline-size: min(340px, calc(100vw - 32px));
	max-inline-size: calc(100vw - 32px);
	flex: 0 0 auto;
}

#main-menu .main-menu-more {
	display: block;
	inline-size: 100%;
	min-inline-size: 100%;
	max-inline-size: 100%;
	flex: 0 0 100%;
	align-self: stretch;
}

#main-menu .main-menu-more > summary,
#main-menu .main-menu-more__actions {
	box-sizing: border-box;
	inline-size: 100%;
	min-inline-size: 100%;
	max-inline-size: 100%;
}

#main-menu .main-menu-more > summary {
	display: flex;
	writing-mode: horizontal-tb;
	white-space: normal;
	text-align: center;
}

@media (max-width: 420px) {
	.screen {
		padding-inline: 1rem;
	}
}

@media (prefers-reduced-motion: reduce) {
	.screen *,
	.screen *::before,
	.screen *::after {
		scroll-behavior: auto !important;
		animation-duration: .001ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: .001ms !important;
	}
}
`;

export default qualityStyles;
