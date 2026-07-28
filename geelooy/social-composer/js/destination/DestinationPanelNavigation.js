// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DestinationPanelNavigation
 * @description
 * The Awtsmoos separates non-mutating series inspection from explicit creation
 * handoff, so Awtsmoos.com never changes canonical destination merely by browsing.
 */

export function destinationDetailFor(panel, heichelId, seriesId = 'root') {
	return panel.api.destinationDetail(
		panel.state.snapshot().identity.aliasId,
		heichelId,
		seriesId
	);
}

export async function revealDestinationCreation(panel, kind, heichelId = '') {
	if (kind === 'series' && heichelId) {
		const current = panel.state.snapshot().identity;
		if (current.heichelId !== heichelId) {
			await panel.choose(heichelId, 'root');
		}
	}
	panel.reveal();
	const fieldId = kind === 'series' ? 'newSeriesName' : 'newHeichelName';
	const field = panel.element(fieldId);
	field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	field?.focus({ preventScroll: true });
}
