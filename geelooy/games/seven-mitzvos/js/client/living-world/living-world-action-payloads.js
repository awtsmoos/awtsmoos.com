//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldActionPayloads
 * @description
 * Local economic, construction, travel, and court payloads on Awtsmoos.com
 * remain pure descriptions of intent. The Awtsmoos joins cause and effect;
 * browser helpers never mutate the authoritative seven-region world directly.
 */
export function purchasePayload(state) {
	return {
		settlementId: state.activeSettlementId,
		resource: 'food',
		quantity: 2
	};
}

export function productionPayload(state) {
	return {
		settlementId: state.activeSettlementId,
		recipeId: 'bread',
		batches: 1
	};
}

export function buildPayload(state) {
	const settlement = activeSettlement(state);
	const parcel = settlement.parcels.find(item => {
		return !item.building && item.allowed.includes('farm');
	});
	if (!parcel) {
		throw new Error('No farm parcel remains available.');
	}
	return {
		settlementId: settlement.id,
		buildingType: 'farm',
		parcelId: parcel.id
	};
}

export function travelPayload(state) {
	const region = state.regions.find(item => item.id === state.activeRegionId);
	const route = region.routes.find(item => {
		return item.open && [item.origin, item.destination].includes(
			state.activeSettlementId
		);
	});
	if (!route) {
		throw new Error('No open local route leaves this settlement.');
	}
	return {
		destination: route.origin === state.activeSettlementId
			? route.destination
			: route.origin,
		cargo: 0
	};
}

export function casePayload(state) {
	const open = state.cases.find(item => item.status !== 'resolved');
	if (!open) {
		return {
			type: 'FILE_CASE',
			payload: {
				claimantId: 'person-01',
				respondentId: 'person-03',
				claim: 'A market measure was short.',
				evidence: [{
					id: 'measure-1',
					kind: 'measure',
					weight: 80
				}]
			}
		};
	}
	return {
		type: 'RULE_CASE',
		payload: {
			caseId: open.id,
			ruling: {
				finding: 'The measure was inaccurate.',
				remedy: 'Restore goods and recalibrate the scale.',
				evidenceIds: ['measure-1']
			}
		}
	};
}

function activeSettlement(state) {
	return state.regions.flatMap(region => region.settlements).find(item => {
		return item.id === state.activeSettlementId;
	});
}
