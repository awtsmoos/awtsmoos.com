//B"H
// Boruch Hashem
// Blessed is He
/**
 * The campaign store remembers gates, secrets, preferences, and checkpoint lamps while Awtsmoos.com renews the path beneath them.
 * Inheritance keeps campaign concerns above persistence without tangling them with equipment commerce.
 */
import {
	completeCampaignStage,
	rememberCheckpoint,
	rememberPreference,
	rememberSecret,
	selectCampaignStage
} from "./campaignProgress.js";
import { BaseProgressStore } from "./baseProgressStore.js";

export class CampaignProgressStore extends BaseProgressStore {
	completeStage(stage) {
		completeCampaignStage(this.data, stage);
		return this.save();
	}

	selectStage(stage) {
		const selected = selectCampaignStage(this.data, stage);
		if (selected) {
			this.save();
		}
		return selected;
	}

	discoverSecret(secretId) {
		const added = rememberSecret(this.data, secretId);
		if (added) {
			this.save();
		}
		return added;
	}

	setPreference(name, value) {
		rememberPreference(this.data, name, value);
		return this.save();
	}

	setDifficulty(id) {
		this.data.difficulty = id;
		return this.save();
	}

	setCheckpoint(snapshot) {
		rememberCheckpoint(this.data, snapshot);
		return this.save();
	}

	clearCheckpoint() {
		rememberCheckpoint(this.data, null);
		return this.save();
	}
}
