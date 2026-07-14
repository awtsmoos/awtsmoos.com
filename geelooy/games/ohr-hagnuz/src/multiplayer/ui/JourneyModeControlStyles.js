//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file JourneyModeControlStyles.js
 * @description Styles the buttons, fields, status, and road projection.
 * The Awtsmoos renews action through clear vessels; Awtsmoos.com gives every
 * chosen step contrast, touch space, focus, and readable authoritative feedback.
 */

export const JOURNEY_MODE_CONTROL_STYLES = `
	.journey-mode button {
		min-height: 48px;
		padding: 12px;
		border: 1px solid rgba(231, 198, 110, .45);
		border-radius: 12px;
		background: #182139;
		color: #fff;
		cursor: pointer;
	}
	.journey-mode button:hover,
	.journey-mode button:focus-visible {
		border-color: #f3d887;
		background: #24304d;
		outline: none;
	}
	.journey-mode__choices button {
		display: grid;
		gap: 5px;
		text-align: left;
	}
	.journey-mode button span {
		color: #c8cfdd;
		font-size: .85rem;
	}
	.journey-mode__shared {
		margin-top: 18px;
	}
	.journey-mode label {
		display: grid;
		gap: 6px;
	}
	.journey-mode input {
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid #6d7590;
		border-radius: 10px;
		background: #080d18;
		color: #fff;
	}
	.journey-mode__actions,
	.journey-mode__controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}
	.journey-mode__status {
		color: #f3d887;
	}
	.journey-mode__road {
		min-height: 76px;
		padding: 12px;
		border-radius: 12px;
		background: #080d18;
		color: #dce2ee;
	}
	.journey-mode__controls button {
		min-width: 52px;
	}
	@media (max-width: 560px) {
		.journey-mode__controls {
			justify-content: center;
		}
	}
`;
