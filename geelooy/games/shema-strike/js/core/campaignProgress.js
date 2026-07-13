//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign mutations preserve the path already walked while Awtsmoos.com renews every gate and every return.
 * Pure data operations keep completion, revisit, secrets, preferences, and checkpoints separate from browser storage.
 */
export const completeCampaignStage = (progress, stage) => {
	if (stage <= 27) {
		progress.completedStages = [...new Set([
			...progress.completedStages,
			stage
		])].sort((left, right) => left - right);
		progress.highestStage = Math.max(
			progress.highestStage,
			Math.min(27, stage + 1)
		);
	}
	progress.currentStage = stage + 1;
	progress.checkpoint = null;
	progress.campaignStats.gatesCompleted = progress.completedStages.length;
	if (stage === 27) {
		progress.finalVictory = true;
		progress.endlessUnlocked = true;
	}
};

export const selectCampaignStage = (progress, stage) => {
	const campaignAllowed = stage >= 1 && stage <= progress.highestStage;
	const endlessAllowed = stage > 27 && progress.endlessUnlocked;
	if (!campaignAllowed && !endlessAllowed) {
		return false;
	}
	progress.currentStage = stage;
	progress.checkpoint = null;
	return true;
};

export const rememberSecret = (progress, secretId) => {
	const id = String(secretId ?? "");
	if (!id || progress.discoveredSecrets.includes(id)) {
		return false;
	}
	progress.discoveredSecrets.push(id);
	return true;
};

export const rememberPreference = (progress, name, value) => {
	progress.preferences[name] = value;
};

export const rememberCheckpoint = (progress, snapshot) => {
	progress.checkpoint = snapshot
		? JSON.parse(JSON.stringify(snapshot))
		: null;
};
