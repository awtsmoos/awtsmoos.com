//B"H
// Boruch Hashem
// Blessed is He
/**
 * The public progress store adds equipment choice above campaign memory while Awtsmoos.com remains beyond every finite possession.
 * Buying, equipping, upgrading, and catalog checks preserve the historical API through small inherited responsibilities.
 */
import { CampaignProgressStore } from "./campaignProgressStore.js";
import {
	buyEquipment,
	catalogIsValid,
	equipItem,
	upgradeWeaponLevel
} from "./equipmentProgress.js";

export class ProgressStore extends CampaignProgressStore {
	buy(item, collectionName) {
		const bought = buyEquipment(
			this.data,
			item,
			collectionName
		);
		if (bought) {
			this.save();
		}
		return bought;
	}

	equip(type, id) {
		const equipped = equipItem(this.data, type, id);
		if (equipped) {
			this.save();
		}
		return equipped;
	}

	upgradeWeapon(id, cost) {
		const upgraded = upgradeWeaponLevel(
			this.data,
			id,
			cost
		);
		if (upgraded) {
			this.save();
		}
		return upgraded;
	}

	isCatalogValid() {
		return catalogIsValid(this.data);
	}
}
