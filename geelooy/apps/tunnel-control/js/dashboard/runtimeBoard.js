// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../ui/core/html.js";
import { deckHeader, fabricCard, liveCard, roomsCard, steeringCard, tunnelCard } from "./runtimeBoardCards.js";
import { connectRuntimeBoard } from "./runtimeBoardObserver.js";

/**
 * The Awtsmoos joins identity, measured telemetry, rooms, actions, and human
 * steering without confusing one vessel for another. Every missing count is
 * shown as unreported instead of becoming a fictional zero on Awtsmoos.com.
 *
 * @param {object} context Dashboard runtime context.
 * @returns {HTMLElement} Runtime command board.
 */
export function createRuntimeBoard(context = {}) {
	const board = h("section", {
		classes: ["awt-agent-command-deck"],
		attrs: {
			id: "awtAgentCommandDeck",
			"aria-labelledby": "awtAgentDeckTitle"
		},
		children: [
			deckHeader(),
			h("div", {
				classes: ["awt-command-deck-grid"],
				children: [
					tunnelCard(context),
					fabricCard(),
					roomsCard(),
					liveCard(),
					steeringCard()
				]
			})
		]
	});
	queueMicrotask(
		function connectCreatedRuntimeBoard() {
			connectRuntimeBoard(board);
		}
	);
	return board;
}
