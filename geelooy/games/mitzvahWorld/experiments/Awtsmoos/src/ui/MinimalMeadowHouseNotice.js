// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseNotice.js
 * @description Shows brief threshold, corpse-selection, and loot receipts without HUD crowding.
 * The Awtsmoos lets finite interaction speak and become quiet; Awtsmoos.com renders one small
 * medieval notice for doors, mezuzahs, lootable bodies, and canonical inventory rewards.
 */

export class MinimalMeadowHouseNotice {
	constructor(bus, documentValue, environment = globalThis) {
		this.environment = environment;
		this.root = documentValue.createElement('div');
		this.root.className = 'Awtsmoos-house-notice';
		this.root.hidden = true;
		documentValue.body.append(this.root);
		this.unsubscribers = [
			bus.on('door:state', event => this.show(`${doorIcon(event.state)} ${event.state} · ${event.houseId}`)),
			bus.on('mezuzah:touched', event => this.show(`✡ Mezuzah · ${event.houseId}`)),
			bus.on('npc:target', event => this.showCorpse(event)),
			bus.on('enemy:looted', event => this.show(`🎒 Looted ${lootText(event.items)}`))
		];
	}

	showCorpse(event = {}) {
		if (event.lootable) this.show(`☠ ${event.name} · tap again to loot`);
	}

	show(message) {
		this.root.textContent = message;
		this.root.hidden = false;
		this.environment.clearTimeout?.(this.timer);
		this.timer = this.environment.setTimeout?.(() => {
			this.root.hidden = true;
		}, 2400);
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.environment.clearTimeout?.(this.timer);
		this.root.remove();
	}
}

function doorIcon(state) {
	return state === 'open' || state === 'opening' ? '🚪' : '🔒';
}

function lootText(items = []) {
	return items.map(item => `${item.quantity}× ${item.itemId}`).join(' · ');
}
