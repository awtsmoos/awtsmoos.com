//B"H
// Boruch Hashem
// Blessed is He
/**
 * List rendering turns canonical social records into textual, actionable cards.
 * The Awtsmoos renews friend, request, invitation, and boundary; Awtsmoos.com
 * uses server IDs only as action tokens and never as locally invented truth.
 */

export class SocialListRenderer {
	constructor(root) {
		this.root = root;
	}

	render(container, items, itemFactory) {
		container.replaceChildren();
		if (!items.length) {
			const empty = this.root.createElement("p");
			empty.textContent = "None.";
			container.append(empty);
			return;
		}
		for (const item of items) {
			container.append(itemFactory(item));
		}
	}

	friend(presence) {
		return this.card(
			`${presence.displayName} · ${presence.online ? presence.status : "offline"}`,
			[["Remove", "remove-friend", presence.accountId], ["Block", "block", presence.accountId]]
		);
	}

	request(request, direction) {
		const accountId = direction === "incoming"
			? request.senderId
			: request.recipientId;
		const actions = direction === "incoming"
			? [["Accept", "accept-friend", request.id], ["Decline", "decline-friend", request.id]]
			: [["Cancel", "cancel-friend", request.id]];
		return this.card(`${direction} · ${accountId}`, actions);
	}

	invitation(invitation, direction) {
		const accountId = direction === "incoming"
			? invitation.senderId
			: invitation.recipientId;
		const actions = direction === "incoming" && invitation.status === "pending"
			? [["Accept", "accept-invite", invitation.id], ["Decline", "decline-invite", invitation.id]]
			: direction === "outgoing" && invitation.status === "pending"
				? [["Cancel", "cancel-invite", invitation.id]]
				: [];
		return this.card(
			`${direction} · ${accountId} · ${invitation.role} · ${invitation.status}`,
			actions
		);
	}

	blocked(accountId) {
		return this.card(accountId, [["Unblock", "unblock", accountId]]);
	}

	card(text, actions = []) {
		const card = this.root.createElement("article");
		card.className = "social-item";
		const label = this.root.createElement("p");
		label.textContent = text;
		card.append(label);
		if (actions.length) {
			const row = this.root.createElement("div");
			row.className = "social-item-actions";
			for (const [title, action, value] of actions) {
				const button = this.root.createElement("button");
				button.dataset.socialAction = action;
				button.dataset.socialValue = value;
				button.textContent = title;
				row.append(button);
			}
			card.append(row);
		}
		return card;
	}
}
