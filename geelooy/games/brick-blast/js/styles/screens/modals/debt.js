// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Gives Brick Blast's forfeit and debt states a distinct visual warning language.
 * The Awtsmoos renews consequence and recovery; Awtsmoos.com keeps financial game
 * pressure readable through borders, color, and hierarchy rather than visual fog.
 *
 * @returns {string}
 * 	Debt and penalty CSS.
 */
const modalDebtStyles = `
.forfeit-content {
	border-color: var(--warning);
	box-shadow: 0 24px 62px rgba(0, 0, 0, .58), inset 0 0 0 1px rgba(250, 204, 21, .12);
}

.forfeit-penalty-display {
	margin: 1rem 0;
	color: var(--danger);
	font-size: 3rem;
	font-weight: 900;
	text-align: center;
}

.debt-content {
	border-color: var(--danger);
	box-shadow: 0 24px 62px rgba(0, 0, 0, .6), inset 0 0 0 1px rgba(248, 113, 113, .12);
}

.debt-assets-list {
	display: flex;
	max-height: 250px;
	flex-direction: column;
	gap: .75rem;
	padding: .75rem;
	overflow-y: auto;
	border: 1px solid #2a3548;
	border-radius: 8px;
	background: #070b13;
}

.debt-asset-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: .75rem;
	padding: .75rem;
	border: 1px solid #334054;
	border-radius: 8px;
	background: #111827;
}

.debt-asset-info {
	color: #fff;
	font-size: .95rem;
}

.debt-asset-name {
	font-weight: 900;
}

.debt-asset-val {
	color: var(--peruta-gold);
	font-size: .85rem;
}

input[type="range"]::-webkit-slider-runnable-track {
	border: 1px solid #334054;
	background: #090e18;
}
`;

export default modalDebtStyles;
