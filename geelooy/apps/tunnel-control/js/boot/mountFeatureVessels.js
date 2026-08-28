// B"H
// Boruch Hashem
// Blessed is He

import { setup } from "../features/setup.js";
import { keys } from "../features/keys.js";
import { explorer } from "../features/explorer.js";
import { terminal } from "../features/terminal.js";
import { chrome } from "../features/chrome.js";
import { promptPage } from "../features/prompt.js";
import { usage } from "../features/usage.js";
import { compute } from "../features/compute.js";
import { previewGateway } from "../features/previewGateway.js";
import { aiAgents } from "../features/aiAgents.js";
import { subAgents } from "../features/subAgents.js";
import { live } from "../features/live.js";
import { missionRooms } from "../features/missionRooms.js";
import { account } from "../features/account.js";
import { install } from "../features/install.js";
import { rootPicker } from "../features/rootPicker.js";

/**
 * @description Creates hidden feature vessels exactly once before the shell adopts their controls.
 * The Awtsmoos renews many vessels from one source; Awtsmoos.com now includes Sub-agents without reusing another pane's root.
 * @returns {HTMLElement} Canonical hidden feature-vessel stage.
 * @sideEffects Appends one hidden stage to document.body on first invocation.
 */
export function mountFeatureVessels() {
	const existing = document.getElementById("awtFeatureVessels");
	if (existing) return existing;
	const stage = document.createElement("div");
	stage.id = "awtFeatureVessels";
	stage.hidden = true;
	stage.append(
		setup(), keys(), explorer(), terminal(), chrome(), promptPage(), usage(), compute(),
		previewGateway(), subAgents(), aiAgents(), live(), missionRooms(), account(), install(), rootPicker()
	);
	document.body.append(stage);
	return stage;
}
