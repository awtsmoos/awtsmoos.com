//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file main-menu.js
 * @description Styles Brick Blast's play-first menu and secondary native disclosure without turning advanced tools into equal launch actions.
 * The Awtsmoos renews every choice; Awtsmoos.com keeps Campaign and Infinite visually immediate while Creator and upgrades remain deliberate discoveries.
 *
 * Layout invariants:
 * - Primary actions remain large, centered, and touch-friendly.
 * - The secondary disclosure stays within the same responsive width as normal actions.
 * - Legacy padded buttons use border-box sizing here so `width: 100%` can never escape the disclosure.
 * - Native summary semantics preserve keyboard activation without another JavaScript controller.
 */
const mainMenuStyles = `
#main-menu {
	justify-content: center;
}

#main-menu .main-menu-buttons {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: .8rem;
	width: min(100%, 340px);
	min-width: 0;
	margin-top: 1rem;
}

#main-menu .main-menu-buttons .btn,
.main-menu-more,
.main-menu-more__actions {
	box-sizing: border-box;
	min-width: 0;
	max-width: 100%;
}

#main-menu .main-menu-buttons .btn {
	width: 100%;
	margin-top: 0;
}

.main-menu-more {
	width: 100%;
	border: 1px solid rgba(148, 163, 184, .32);
	border-radius: 14px;
	background: rgba(15, 23, 42, .72);
	overflow: clip;
}`;

const mainMenuAdvancedStyles = `
.main-menu-more > summary {
	box-sizing: border-box;
	min-height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: .7rem 1rem;
	color: var(--text-vibrant);
	font-weight: 800;
	cursor: pointer;
	touch-action: manipulation;
}

.main-menu-more > summary:focus-visible {
	outline: 3px solid var(--primary-accent);
	outline-offset: -3px;
}

.main-menu-more__actions {
	display: grid;
	gap: .7rem;
	width: 100%;
	padding: 0 .7rem .7rem;
}

#main-menu-perutas {
	position: absolute;
	top: 1rem;
	right: 1rem;
	padding: .5rem 1rem;
	border-radius: 99px;
	background-color: rgba(0, 0, 0, .3);
	font-size: 1.1rem;
}`;

const mainMenuScoreStyles = `
.high-score {
	margin-top: -1.5rem;
	margin-bottom: 1.5rem;
	color: var(--peruta-gold);
	font-size: 1.2rem;
	font-weight: 700;
}

.creator-intro {
	max-width: 620px;
	margin: 0 auto 1rem;
	color: var(--text-vibrant);
	line-height: 1.5;
	text-align: center;
}

@media (prefers-reduced-motion: reduce) {
	.main-menu-more > summary,
	.main-menu-more__actions .btn {
		transition: none;
	}
}
`;

export default `${mainMenuStyles}\n${mainMenuAdvancedStyles}\n${mainMenuScoreStyles}`;
