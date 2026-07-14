//B"H
//Boruch Hashem
//Blessed is He

/**
 * Regional shops offer explicit goods at explicit prices without gambling or hidden
 * scarcity. The Awtsmoos renews merchant and material together; Awtsmoos.com keeps
 * every offer immutable, reputation-gated, and resolvable through stable catalog ids.
 */

export const EXPEDITION_SHOPS = Object.freeze([
	shop('citadel-provisions', 'malchus-citadel', 'Citadel Provisions', [
		offer('material', 'cedar-heartwood', 2, 12, 0),
		offer('material', 'crown-stone', 1, 22, 2),
		offer('gear', 'cedar-edge', 1, 75, 4)
	]),
	shop('moonworks-exchange', 'moonworks-city', 'Moonworks Exchange', [
		offer('material', 'lunar-brass', 2, 18, 0),
		offer('material', 'silver-reed', 1, 28, 3),
		offer('gear', 'foundation-boots', 1, 96, 5)
	]),
	shop('mirror-arcade', 'mirror-market', 'Mirror Arcade', [
		offer('material', 'mirror-glass', 1, 32, 3),
		offer('gear', 'echo-mantle', 1, 110, 6),
		offer('gear', 'mirror-blade', 1, 125, 7)
	]),
	shop('victory-quartermaster', 'victory-port', 'Victory Quartermaster', [
		offer('material', 'causeway-steel', 1, 38, 4),
		offer('gear', 'victory-boots', 1, 145, 8),
		offer('gear', 'causeway-spear', 1, 160, 9)
	]),
	shop('harmony-bazaar', 'harmony-city', 'Harmony Bazaar', [
		offer('material', 'heart-crystal', 1, 48, 5),
		offer('gear', 'harmony-mail', 1, 175, 10),
		offer('gear', 'heart-relic', 1, 190, 11)
	]),
	shop('forgehold-armory', 'forgehold', 'Forgehold Armory', [
		offer('material', 'ironwood-core', 1, 56, 6),
		offer('gear', 'gevurah-axe', 1, 210, 12),
		offer('gear', 'iron-cuirass', 1, 230, 13)
	]),
	shop('riverlight-market', 'river-city', 'Riverlight Market', [
		offer('material', 'riverlight-thread', 1, 62, 7),
		offer('gear', 'mercy-shield', 1, 245, 14),
		offer('gear', 'river-mantle', 1, 260, 15)
	]),
	shop('forms-repository', 'understanding-city', 'Repository of Forms', [
		offer('material', 'form-plate', 1, 72, 8),
		offer('gear', 'binah-plate', 1, 290, 16),
		offer('gear', 'labyrinth-relic', 1, 310, 17)
	]),
	shop('storm-camp-cache', 'storm-camp', 'Storm Camp Cache', [
		offer('material', 'storm-crystal', 1, 84, 9),
		offer('gear', 'storm-gauntlet', 1, 335, 18),
		offer('gear', 'lightning-boots', 1, 350, 19)
	]),
	shop('crown-city-treasury', 'crown-city', 'Crown City Treasury', [
		offer('material', 'crown-ember', 1, 100, 10),
		offer('gear', 'crown-armor', 1, 400, 20),
		offer('gear', 'unbounded-mantle', 1, 425, 22)
	])
]);

export function expeditionShopForLocation(locationId) {
	return EXPEDITION_SHOPS.find(shopData => shopData.locationId === locationId) || null;
}

function shop(id, locationId, name, offers) {
	return Object.freeze({ id, locationId, name, offers: Object.freeze(offers) });
}

function offer(kind, itemId, quantity, price, reputation) {
	return Object.freeze({ kind, itemId, quantity, price, reputation });
}
