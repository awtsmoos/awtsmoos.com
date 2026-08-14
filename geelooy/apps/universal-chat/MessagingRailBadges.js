// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects existing private-store truth into small Chats and Requests badges without creating another counter lifecycle.
 * @description The Awtsmoos knows every unread sequence and pending gate before a badge appears; Awtsmoos.com merely reflects those lawful store projections in light,
 * clearing them with private identity and never inventing persistence, polling, or engagement pressure merely to make navigation feel alive.
 */

/** Watches canonical private store changes and renders only the two high-value navigation counts. */
export class MessagingRailBadges {
	constructor(rail, store) {
		this.rail = rail;
		this.store = store;
		this.store.addEventListener?.("change", () => this.render());
		this.render();
	}

	render() {
		const counts = messagingBadgeCounts(this.store);
		this.update("chats", counts.chats, "unread private messages");
		this.update("requests", counts.requests, "pending requests");
	}

	update(section, count, description) {
		const button = this.rail.querySelector(`[data-section="${section}"]`);
		if (!button) return;
		const baseLabel = button.dataset.badgeBaseLabel
			|| button.getAttribute("aria-label")
			|| section;
		button.dataset.badgeBaseLabel = baseLabel;
		button.querySelector(".messaging-rail-badge")?.remove();
		if (!count) {
			button.setAttribute("aria-label", baseLabel);
			return;
		}
		const badge = document.createElement("span");
		badge.className = "messaging-rail-badge";
		badge.setAttribute("aria-hidden", "true");
		badge.textContent = count > 99 ? "99+" : String(count);
		button.appendChild(badge);
		button.setAttribute("aria-label", `${baseLabel}, ${count} ${description}`);
	}
}

/** Computes display counts only from the already-authorized store projection. */
export function messagingBadgeCounts(store = {}) {
	if (!String(store.actor?.alias || "").trim()) {
		return { chats: 0, requests: 0 };
	}
	const chats = (store.conversations || [])
		.filter((conversation) => conversation.kind === "direct")
		.reduce((total, conversation) => total + Math.max(
			0,
			Number(conversation.lastSequence || 0)
				- Number(conversation.lastReadSequence || 0)
		), 0);
	const requests = (store.requests?.incoming || [])
		.filter((request) => request.state === "pending")
		.length;
	return { chats, requests };
}
