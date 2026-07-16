//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrokenMeasureCourtContent
 * @description
 * Testimony enters court on Awtsmoos.com only with visible origin and custody.
 * The Awtsmoos knows the hidden act directly; finite judges must distinguish
 * physical proof, verified records, human statements, rumor, and measured harm.
 */
export function createCourtCase(previous) {
	const market = previous.market;
	const sanctuary = previous.sanctuary;
	return {
		title: 'The Weight of Testimony',
		question: 'Which merchant is liable for the underweight feed shipment, and why?',
		evidence: [
			evidence('Seized false weight', market.weightEvidenceSecured, 'physical', 'The hollow grain weight is sealed and labeled.'),
			evidence('Market inspection record', market.fraudIdentified, 'record', 'The inspection identifies Marek as the user of the false weight.'),
			evidence('Sanctuary shortage record', sanctuary.inventoryRecordCreated, 'record', 'The received feed is measured below the delivery receipt.'),
			evidence('Honest merchant statement', market.honestMerchantProtected, 'testimony', 'Rina describes her sealed standard and replacement offer.'),
			evidence('Anonymous accusation', false, 'rumor', 'An unknown writer accuses the cheapest merchant.'),
			evidence('Chain-of-custody log', market.weightEvidenceSecured, 'custody', 'The seized weight remained sealed from market to court.')
		],
		verdicts: [
			{ id: 'false-grain-liable', label: 'Marek is liable' },
			{ id: 'honest-grain-liable', label: 'Rina is liable' },
			{ id: 'not-proven', label: 'Liability is not proven' }
		],
		rationales: [
			'Admissible false weight, preserved custody, verified records, and measured harm connect Marek to the shortage.',
			'Marek offered the lowest price, so he must be guilty.',
			'The anonymous accusation is enough because the shortage was serious.',
			'Rina was cheapest after the refund, so her honest bargain proves deception.'
		]
	};
}

function evidence(title, reliable, kind, text) {
	return { title, reliable, kind, text };
}
