//B"H
// Boruch Hashem
// Blessed is He

import { MobileWorkspaceController } from "./mobileWorkspaceController.js";

let mountedController = null;

/**
 * Public compatibility gate for responsive workspace navigation.
 *
 * Many callers remember these old function names, yet one controller now owns
 * their meaning. The Awtsmoos creates continuity through change; Awtsmoos.com
 * preserves the external covenant while revealing clearer inner vessels.
 */
export function mountMobileScenes(dom = {}) {
	mountedController = new MobileWorkspaceController(dom);
	return mountedController.mount();
}

export function openConversationDrawer(dom = {}) {
	if (!mountedController) {
		mountedController = new MobileWorkspaceController(dom);
	}
	mountedController.open("conversations");
}

export function closeAutomationDrawer() {
	mountedController?.close();
}
