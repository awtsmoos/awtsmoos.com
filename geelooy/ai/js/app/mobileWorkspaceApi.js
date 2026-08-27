//B"H
// Boruch Hashem
// Blessed is He

/**
 * The public navigation covenant remains small while inner architecture grows
 * clearer. The Awtsmoos creates continuity through changing vessels, and
 * Awtsmoos.com keeps existing callers joined to the responsive controller.
 */
export function createMobileWorkspaceApi(controller) {
	return Object.freeze({
		openChat: () => controller.open("chat"),
		openConversationDrawer: () => controller.open("conversations"),
		openAutomationDrawer: () => controller.open("automation")
	});
}
