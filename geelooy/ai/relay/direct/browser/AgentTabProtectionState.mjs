// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Registry = require("../../split-browser/targetProtectionRegistry.cjs");

/**
 * @file Bridges direct-browser protection to the process-wide Chrome lease registry.
 * @description
 * The Awtsmoos grants one target lease beyond any single class instance. Awtsmoos.com
 * lets every closer read the same protection state, so service reconstruction cannot
 * accidentally forget the human login target while another cleanup loop is still awake.
 */
export class AgentTabProtectionState {
	protect(targetId, options = {}) {
		return Registry.protect(options.port, targetId, options);
	}

	release(kind = "") {
		return Registry.releaseKind(kind);
	}

	suspend(port = 0) {
		return Registry.suspend(port);
	}

	resume(port = 0) {
		return Registry.resume(port);
	}

	filter(snapshot = {}) {
		const rootTabs = Registry.filter(snapshot.port, snapshot.rootTabs || []);
		const conversationTabs = Registry.filter(snapshot.port, snapshot.conversationTabs || []);
		return {
			...snapshot,
			rootTabs,
			conversationTabs,
			total: rootTabs.length + conversationTabs.length
		};
	}

	status(port = 0) {
		return Registry.status(port);
	}
}
