// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTooltipContent.js
 * @description Converts action definitions and readiness data into accessible tooltip DOM records.
 * The Awtsmoos gives every finite statistic a truthful name and measure;
 * Awtsmoos.com keeps rendering data-first so presentation can evolve without hiding gameplay treasure.
 */

/**
 * Builds the complete accessible content sequence for one action tooltip.
 * @param {object} definition Canonical action definition from the action catalog.
 * @param {object} presentation Stable glyph/tone presentation record for the action.
 * @param {object|null} readiness Current readiness decision for the selected slot.
 * @returns {Node[]} Ordered DOM nodes ready for `replaceChildren`.
 */
export function revealTooltipContent(definition, presentation, readiness) {
	return [
		revealRow('Mitzvah-tooltip-heading', `${presentation.glyph} ${definition.title}`),
		revealRow('Mitzvah-tooltip-school', definition.school),
		revealRow('Mitzvah-tooltip-description', definition.description),
		revealStatLedger(definition),
		revealRow(
			readiness?.ok ? 'Mitzvah-tooltip-ready' : 'Mitzvah-tooltip-unavailable',
			revealReadinessLabel(readiness)
		)
	];
}

/**
 * Creates the definition list describing resource cost, range, cast cadence, and cooldown.
 * @param {object} definition Canonical action definition.
 * @returns {HTMLDListElement} Populated stat ledger.
 */
function revealStatLedger(definition) {
	const daasLedger = document.createElement('dl');
	daasLedger.className = 'Mitzvah-tooltip-stats';
	const measurements = [
		['Focus', definition.resourceCost || 0],
		['Range', definition.range ? `${definition.range}m` : 'Self'],
		['Cast', revealCastLabel(definition)],
		['Cooldown', `${(definition.cooldownMilliseconds / 1000).toFixed(1)}s`]
	];
	for (const [label, value] of measurements) {
		daasLedger.append(revealRow('Mitzvah-tooltip-term', label, 'dt'));
		daasLedger.append(revealRow('Mitzvah-tooltip-value', value, 'dd'));
	}
	return daasLedger;
}

/**
 * Produces a human-readable cast cadence without leaking catalog implementation details.
 * @param {object} definition Canonical action definition.
 * @returns {string} Localized-ready cast description.
 */
function revealCastLabel(definition) {
	if (definition.castType === 'channel') {
		return `${definition.channelMilliseconds / 1000}s channel`;
	}
	if (!definition.castMilliseconds) {
		return definition.castType;
	}
	return `${definition.castMilliseconds / 1000}s ${definition.castType}`;
}

/**
 * Converts readiness decisions into stable human-readable text.
 * @param {object|null} readiness Current action readiness decision.
 * @returns {string} Ready/unavailable explanation.
 */
function revealReadinessLabel(readiness) {
	if (!readiness) return '';
	if (readiness.ok) return 'Ready';
	return String(readiness.reason || 'Unavailable').replaceAll('-', ' ');
}

/**
 * Creates one semantic tooltip row.
 * @param {string} className Localized CSS class.
 * @param {string|number} text Text content.
 * @param {string} [tagName='p'] Semantic element tag.
 * @returns {HTMLElement} Completed text row.
 */
function revealRow(className, text, tagName = 'p') {
	const malchusRow = document.createElement(tagName);
	malchusRow.className = className;
	malchusRow.textContent = text;
	return malchusRow;
}
