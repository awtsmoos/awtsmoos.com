//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeLayoutStyles.js
 * @description Holds the spatial garment of the journey choice.
 * The Awtsmoos gives every light a measured place; Awtsmoos.com lets this
 * overlay remain readable without taking ownership of the world beneath it.
 */

export const JOURNEY_MODE_LAYOUT_STYLES = `
	.journey-mode-root {
		position: fixed;
		inset: 0;
		z-index: 5000;
		display: grid;
		place-items: center;
		padding: 18px;
		background: rgba(5, 8, 18, .82);
		backdrop-filter: blur(9px);
	}
	.journey-mode-root[hidden] {
		display: none;
	}
	.journey-mode {
		width: min(620px, 100%);
		max-height: 92vh;
		overflow: auto;
		padding: 24px;
		border: 1px solid rgba(236, 201, 119, .55);
		border-radius: 20px;
		background: linear-gradient(145deg, #11182a, #070b14);
		color: #f8efd9;
		box-shadow: 0 28px 80px #000;
	}
	.journey-mode header {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.journey-mode h1 {
		margin: 0;
		font-size: clamp(1.55rem, 5vw, 2.5rem);
	}
	.journey-mode__mark {
		display: grid;
		place-items: center;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: #e7c66e;
		color: #12101a;
		font-size: 2rem;
	}
	.journey-mode__eyebrow {
		margin: 0;
		color: #e7c66e;
		text-transform: uppercase;
		letter-spacing: .16em;
		font-size: .72rem;
	}
	.journey-mode__choices {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin-top: 20px;
	}
	@media (max-width: 560px) {
		.journey-mode-root {
			padding: 10px;
		}
		.journey-mode {
			padding: 18px;
			border-radius: 16px;
		}
		.journey-mode__choices {
			grid-template-columns: 1fr;
		}
	}
`;
