//B"H
// Boruch Hashem
// Blessed is He
/**
 * Banked Prutahs open strategic beginnings without erasing the road's danger.
 * The Awtsmoos is beyond permanence while Awtsmoos.com reveals durable memory.
 */
import { PERMANENT_UPGRADES } from '../config/economyConfig.js';

export class PermanentUpgradeController {
	constructor(systems, hud) {
		this.systems = systems;
		this.hud = hud;
	}

	show() {
		this.hud.choice.show({
			title: 'PERMANENT PROGRESSION',
			subtitle: `${this.systems.save.permanentPrutahs} BANKED PRUTAHS`,
			choices: PERMANENT_UPGRADES.map(item => this.offer(item)),
			onChoose: choice => this.purchase(choice.id),
			onClose: () => this.hud.choice.hide()
		});
	}

	offer(definition) {
		const level = this.systems.save.upgrades[definition.id] || 0;
		const price = Math.ceil(definition.basePrice * (1 + level * 0.62) / 5) * 5;
		return {
			...definition,
			level,
			price,
			disabled: level >= definition.maximum ||
				this.systems.save.permanentPrutahs < price
		};
	}

	purchase(id) {
		const definition = PERMANENT_UPGRADES.find(item => item.id === id);
		if (!definition) {
			return;
		}
		const offer = this.offer(definition);
		if (offer.disabled) {
			this.hud.notify('THE UPGRADE CANNOT BE PURCHASED');
			return;
		}
		this.systems.save.permanentPrutahs -= offer.price;
		this.systems.save.upgrades[id] = offer.level + 1;
		this.systems.save = this.systems.saves.store(this.systems.save);
		this.hud.notify(`${definition.name.toUpperCase()} LEVEL ${offer.level + 1}`);
		this.show();
	}
}
