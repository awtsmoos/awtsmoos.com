// B"H

import { h } from "../ui/core/html.js";
import { deckHeader, liveCard, roomsCard, steeringCard, tunnelCard } from "./runtimeBoardCards.js";
import { connectRuntimeBoard } from "./runtimeBoardObserver.js";

/**
 * B"H — This board contains no invented agents. It reflects the same live room
 * and action vessels that power the detailed workspaces, then opens those panes.
 */
export function createRuntimeBoard(ctx = {}) {
	const board = h("section", {
		classes: ["awt-agent-command-deck"],
		attrs: { id: "awtAgentCommandDeck", "aria-labelledby": "awtAgentDeckTitle" },
		children: [
			deckHeader(),
			h("div", { classes: ["awt-command-deck-grid"], children: [
				tunnelCard(ctx), roomsCard(), liveCard(), steeringCard()
			] })
		]
	});
	queueMicrotask(() => connectRuntimeBoard(board));
	return board;
}
