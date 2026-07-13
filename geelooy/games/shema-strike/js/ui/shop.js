//B"H
// Boruch Hashem
// Blessed is He
/**
 * The market lets earned sparks strengthen chosen vessels; Awtsmoos.com is never bought, sold, upgraded, or diminished.
 * Purchases, equipment, five weapon levels, armor, and affordability states are rendered from the versioned store.
 */
import { ARMOR, WEAPONS } from "../config/catalogs.js";
import { GAMEPLAY } from "../config/gameConfig.js";

const upgradeCost = (weapon, level) => Math.round(Math.max(60, weapon.cost * 0.42 + 45) * level * GAMEPLAY.upgradeMultiplier);

export class ShopView {
	constructor(store, onChanged, root = document) {
		this.store = store;
		this.onChanged = onChanged;
		this.grid = root.getElementById("shop-grid");
		this.coinLabel = root.getElementById("shop-coins");
		this.tab = "weapons";
		for (const button of root.querySelectorAll("[data-shop-tab]")) {
			button.addEventListener("click", () => this.selectTab(button.dataset.shopTab));
		}
	}

	selectTab(tab) {
		this.tab = tab;
		for (const button of document.querySelectorAll("[data-shop-tab]")) {
			button.classList.toggle("active", button.dataset.shopTab === tab);
		}
		this.render();
	}

	render() {
		this.coinLabel.textContent = `${this.store.data.coins} פרוטות`;
		this.grid.replaceChildren();
		const catalog = this.tab === "weapons" ? WEAPONS : ARMOR;
		for (const item of catalog) {
			this.grid.append(this.createCard(item));
		}
	}

	createCard(item) {
		const weaponMode = this.tab === "weapons";
		const ownedKey = weaponMode ? "ownedWeapons" : "ownedArmor";
		const equippedKey = weaponMode ? "equippedWeapon" : "equippedArmor";
		const owned = this.store.data[ownedKey].includes(item.id);
		const equipped = this.store.data[equippedKey] === item.id;
		const level = weaponMode ? this.store.data.weaponLevels[item.id] ?? 1 : 1;
		const card = document.createElement("article");
		card.className = `shop-card${equipped ? " equipped" : ""}`;
		const statistics = weaponMode
			? `Damage ${item.damage} · Reach ${item.reach} · Level ${level}/5`
			: `Defense ${Math.round(item.defense * 100)}% · Vitality +${item.vitality} · Speed ×${item.speed}`;
		card.innerHTML = `<h3>${item.name}</h3><p>${item.trait ?? statistics}</p><p>${statistics}</p>`;
		const button = document.createElement("button");
		const action = this.resolveAction(item, owned, equipped, level);
		button.textContent = action.label;
		button.disabled = action.disabled;
		button.addEventListener("click", () => {
			action.execute();
			this.onChanged();
			this.render();
		});
		card.append(button);
		return card;
	}

	resolveAction(item, owned, equipped, level) {
		if (!owned) {
			return {
				label: `BUY · ${item.cost}`, disabled: this.store.data.coins < item.cost,
				execute: () => this.store.buy(item, this.tab === "weapons" ? "ownedWeapons" : "ownedArmor")
			};
		}
		if (!equipped) {
			return { label: "EQUIP", disabled: false, execute: () => this.store.equip(this.tab === "weapons" ? "weapon" : "armor", item.id) };
		}
		if (this.tab === "weapons" && level < 5) {
			const cost = upgradeCost(item, level);
			return { label: `UPGRADE · ${cost}`, disabled: this.store.data.coins < cost, execute: () => this.store.upgradeWeapon(item.id, cost) };
		}
		return { label: level >= 5 ? "MASTERED" : "EQUIPPED", disabled: true, execute: () => {} };
	}
}
