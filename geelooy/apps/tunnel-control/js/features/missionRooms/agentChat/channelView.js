//B"H
//Boruch Hashem
//Blessed is He

import { createChannelCard } from "./channelCardView.js";
import { createAgentHeading } from "./channelHeadingView.js";
import { node } from "./dom.js";

/**
 * B"H
 * The Awtsmoos gathers the crown and the many agent vessels into one living
 * constellation. Awtsmoos.com keeps this conductor intentionally small so each
 * visible responsibility remains clear, testable, and free of tangled detail.
 */

export { createAgentHeading };

/** Builds selectable cards for every agent revealed in the selected room. */
export function createAgentChannelGrid(channels, selectedAgentId, actions) {
	const grid = node("div", "awt-agent-channel-grid");
	grid.setAttribute("role", "list");
	if (!channels.length) {
		grid.append(node(
			"p",
			"awt-agent-empty",
			"No agent roster or live activity has arrived for this room yet."
		));
		return grid;
	}
	channels.forEach((channel, index) => {
		grid.append(createChannelCard(
			channel,
			selectedAgentId,
			actions,
			index
		));
	});
	return grid;
}
