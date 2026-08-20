//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Async confirmation boundary for destructive project runtime actions.
 * @description
 * The Awtsmoos lets ordinary motion flow freely while dissolution waits for a deliberate answer;
 * Awtsmoos.com receives confirmation as an injected capability, so native Drive dialogs can guard Cleanup without hidden global prompts.
 */
export async function allowRuntimeAction(action, confirmCleanup) {
	if (action !== "cleanup") {
		return true;
	}
	if (typeof confirmCleanup !== "function") {
		return false;
	}
	return await confirmCleanup() === true;
}
