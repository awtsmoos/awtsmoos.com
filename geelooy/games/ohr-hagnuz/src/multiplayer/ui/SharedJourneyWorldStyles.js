//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyWorldStyles.js
 * @description Styles the authenticated tile world, entities, and battle state.
 * The Awtsmoos clothes every visible form without possessing form; Awtsmoos.com
 * gives remote travelers, lamp, and Wisp clear, responsive, accessible vessels.
 */

export const SHARED_JOURNEY_WORLD_STYLES = `
	.journey-mode__identity-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.journey-mode__auth-note {
		color: #aeb8cc;
		font-size: .82rem;
	}
	.journey-mode__world {
		margin-top: 12px;
		overflow: auto;
		border: 1px solid rgba(231, 198, 110, .35);
		border-radius: 14px;
		background: radial-gradient(circle at 60% 45%, #24314b, #080d18 72%);
	}
	.shared-road-grid {
		display: grid;
		grid-template-columns: repeat(13, minmax(34px, 1fr));
		width: max(100%, 520px);
		aspect-ratio: 13 / 9;
		padding: 8px;
	}
	.shared-road-cell {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 34px;
		border: 1px solid rgba(255, 255, 255, .045);
		background: rgba(31, 43, 62, .38);
	}
	.road-traveler,
	.road-lamp,
	.veil-wisp {
		position: absolute;
		z-index: 2;
		display: grid;
		place-items: center;
		min-width: 28px;
		min-height: 28px;
		border-radius: 50%;
		filter: drop-shadow(0 4px 6px #000);
	}
	.road-traveler {
		background: #324565;
		border: 1px solid #93a8cb;
		color: #fff;
	}
	.road-traveler--self {
		background: #d8ba64;
		border-color: #fff0ac;
		color: #15111d;
	}
	.road-traveler small {
		position: absolute;
		top: 29px;
		width: max-content;
		max-width: 86px;
		overflow: hidden;
		color: #eef2fa;
		font-size: 8px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.road-lamp--lit {
		box-shadow: 0 0 18px #ffcf62;
	}
	.veil-wisp {
		background: #47245f;
		border: 1px solid #c18de5;
		color: #f2d8ff;
	}
	.veil-wisp--defeated {
		opacity: .48;
	}
	.journey-mode__combat {
		min-height: 24px;
		color: #e8cf8a;
	}
	@media (max-width: 560px) {
		.journey-mode__identity-fields {
			grid-template-columns: 1fr;
		}
		.shared-road-grid {
			grid-template-columns: repeat(13, 34px);
		}
	}
`;
