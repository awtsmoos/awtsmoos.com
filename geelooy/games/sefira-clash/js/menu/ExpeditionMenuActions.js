//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition menu actions translate visible intent into persisted model operations.
 * The Awtsmoos renews road, citizen, market, workshop, gear, quest, and sync together;
 * Awtsmoos.com keeps status and refresh behavior explicit outside presentation modules.
 */

export function createExpeditionMenuActions(flow, refresh) {
	return {
		onBeginLocation: locationId => beginLocation(flow, locationId),
		onInspectLocation: locationId => inspectLocation(flow, locationId, refresh),
		onEquip: gearId => equip(flow, gearId, refresh),
		onQuest: (action, questId) => quest(flow, action, questId, refresh),
		onCitizen: citizen => citizenService(flow, citizen, refresh),
		onPurchase: (shopId, offerIndex) => purchase(flow, shopId, offerIndex, refresh),
		onCraft: recipeId => craft(flow, recipeId, refresh),
		onSync: action => synchronize(flow, action, refresh)
	};
}

function beginLocation(flow, locationId) {
	const map = flow.model.expedition.selectLocation(locationId);
	if (map) flow.onBeginMatch(map, 'expedition');
}

function inspectLocation(flow, locationId, refresh) {
	if (!flow.model.expedition.inspectLocation(locationId)) return;
	flow.status.textContent = `Inspecting ${flow.model.expedition.snapshot().activeLocation.name}.`;
	refresh();
}

function equip(flow, gearId, refresh) {
	const changed = flow.model.expedition.equip(gearId);
	flow.status.textContent = changed
		? 'Equipment covenant updated.'
		: 'That gear is already equipped.';
	refresh();
}

function quest(flow, action, questId, refresh) {
	const changed =
		action === 'activate'
			? flow.model.expedition.activateQuest(questId)
			: flow.model.expedition.claimQuest(questId).claimed;
	flow.status.textContent = changed
		? `Quest ${action} succeeded.`
		: `Quest ${action} is not currently lawful.`;
	refresh();
}

function citizenService(flow, citizen, refresh) {
	const result = flow.model.expedition.useCitizen(citizen.citizenId);
	flow.status.textContent = result.changed
		? `${citizen.name}: ${serviceSuccess(citizen.service)}`
		: `${citizen.name}: ${visibleReason(result.reason)}`;
	refresh();
}

function purchase(flow, shopId, offerIndex, refresh) {
	const result = flow.model.expedition.purchase(shopId, offerIndex);
	flow.status.textContent = result.purchased
		? 'Purchase completed atomically.'
		: visibleReason(result.reason);
	refresh();
}

function craft(flow, recipeId, refresh) {
	const result = flow.model.expedition.craft(recipeId);
	flow.status.textContent = result.crafted
		? `${result.recipe.name} crafted.`
		: visibleReason(result.reason);
	refresh();
}

async function synchronize(flow, action, refresh) {
	flow.status.textContent =
		action === 'pull'
			? 'Pulling and merging remote Expedition.'
			: 'Pushing Expedition profile.';
	refresh();
	const result = await flow.expeditionSync[action]();
	flow.status.textContent = result.ok
		? flow.expeditionSync.snapshot().message
		: flow.expeditionSync.snapshot().message;
	refresh();
}

function serviceSuccess(service) {
	if (service === 'quests') return 'quest covenant activated.';
	if (service === 'shop') return 'merchant inventory revealed.';
	if (service === 'craft') return 'workshop ledger revealed.';
	if (service === 'heal') return 'rest blessing received.';
	return 'lore remembered and reputation increased.';
}

function visibleReason(reason) {
	return String(reason || 'No change')
		.replaceAll('_', ' ')
		.toLowerCase();
}
