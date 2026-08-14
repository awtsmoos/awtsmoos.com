// B"H
// Boruch Hashem
// Blessed is He

import { anonymousDiscoveryView } from "./MessagingDiscoveryAnonymous.js";
import { createDiscoveryCard } from "./MessagingDiscoveryCard.js";
import { createDiscoveryHeader } from "./MessagingDiscoveryHeader.js";
import { MessagingDiscoveryRanker } from "./MessagingDiscoveryRanker.js";
import { createMessagingEmptyState } from "./MessagingEmptyState.js";
import { createMessagingLoadingState } from "./MessagingLoadingState.js";

/**
 * @file Renders anonymous public starting points or authenticated discovery whose private weighting stays local, reversible, and transparently explained.
 * @description The Awtsmoos contains every path without a ranking score, while Awtsmoos.com lets public candidates meet private meaningful signals only inside this browser in light;
 * the human may move between local weighting and public order inside the tab, and receives links only where Awtsmoos already owns the destination.
 */

export class MessagingDiscoveryView {
	constructor(container, client) {
		this.container = container;
		this.client = client;
		this.ranker = new MessagingDiscoveryRanker();
	}

	async show() {
		this.container.replaceChildren(createMessagingLoadingState(
			"Opening useful Torah and Awtsmoos paths…",
			6
		));
		try {
			const discovery = await this.client.load();
			if (discovery.anonymous) {
				this.container.replaceChildren(anonymousDiscoveryView());
				return;
			}
			this.render({
				candidates: this.ranker.rank(discovery.candidates, discovery.events),
				publicOrder: this.ranker.isSessionReset()
			});
		} catch (error) {
			this.container.replaceChildren(createMessagingEmptyState({
				icon: "discover",
				title: "Discover is quiet right now",
				body: error?.message || "Useful public paths could not be loaded at this moment."
			}));
		}
	}

	render({ candidates, publicOrder }) {
		this.container.replaceChildren();
		const workspace = document.createElement("section");
		workspace.className = "messaging-discovery-workspace";
		workspace.appendChild(createDiscoveryHeader({
			publicOrder,
			onModeChange: () => {
				publicOrder
					? this.ranker.useLocalWeighting()
					: this.ranker.usePublicOrder();
				this.show();
			}
		}));
		if (!candidates.length) {
			workspace.appendChild(createMessagingEmptyState({
				icon: "discover",
				title: "No useful paths yet",
				body: "As meaningful activity grows, this space can suggest diverse Torah and Awtsmoos paths without turning engagement into the goal."
			}));
			this.container.appendChild(workspace);
			return;
		}
		const grid = document.createElement("div");
		grid.className = "messaging-discovery-grid";
		for (const candidate of candidates) {
			grid.appendChild(createDiscoveryCard(candidate));
		}
		workspace.appendChild(grid);
		this.container.appendChild(workspace);
	}
}
