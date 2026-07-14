//B"H
// Boruch Hashem
// Blessed is He
/**
 * The social view mounts one optional console beside campaign and arena play.
 * The Awtsmoos renews profile, covenant, boundary, and invitation; Awtsmoos.com
 * renders server records and sends explicit user choices through named bindings.
 */
import { SocialListRenderer } from "./SocialListRenderer.js";
import { SOCIAL_MARKUP } from "./SocialMarkup.js";
import { installSocialStyles } from "./SocialStyles.js";
import { bindSocialView } from "./SocialViewBindings.js";
import { captureSocialElements } from "./SocialViewElements.js";

export class SocialView {
	constructor(root = document) {
		this.root = root;
		installSocialStyles(root);
		this.mount();
		this.elements = captureSocialElements(root);
		this.lists = new SocialListRenderer(root);
	}
	mount() {
		const button = this.root.createElement("button");
		button.id = "social-button";
		button.textContent = "SOCIAL";
		this.root.querySelector(".start-actions").append(button);
		this.root.getElementById("game-shell")
			.insertAdjacentHTML("beforeend", SOCIAL_MARKUP);
	}
	bind(actions) {
		bindSocialView(this, actions);
	}
	profile() {
		return {
			displayName: this.elements.displayName.value,
			privacy: {
				invitations: this.elements.invitePrivacy.value,
				presence: this.elements.presencePrivacy.value
			},
			status: this.elements.status.value
		};
	}
	target() {
		return this.elements.target.value.trim();
	}
	invitation() {
		return {
			message: this.elements.inviteMessage.value.trim(),
			recipientId: this.target(),
			role: this.elements.inviteRole.value
		};
	}
	show() {
		this.elements.overlay.classList.add("visible");
		this.elements.displayName.focus();
	}
	hide() {
		this.elements.overlay.classList.remove("visible");
	}
	setStatus(message) {
		this.elements.statusMessage.textContent = message;
	}
	render(state) {
		const presence = new Map(
			state.presence.map((item) => [item.accountId, item])
		);
		const friends = state.relationships.friends.map((accountId) =>
			presence.get(accountId) || offlineFriend(accountId)
		);
		this.lists.render(
			this.elements.friends,
			friends,
			(item) => this.lists.friend(item)
		);
		this.renderRequests(state.relationships);
		this.renderInvitations(state.invitations);
		this.lists.render(
			this.elements.blocks,
			state.blocks,
			(accountId) => this.lists.blocked(accountId)
		);
	}
	renderRequests(relationships) {
		const entries = [
			...relationships.incoming.map((item) => ({ direction: "incoming", item })),
			...relationships.outgoing.map((item) => ({ direction: "outgoing", item }))
		];
		this.lists.render(
			this.elements.requests,
			entries,
			({ direction, item }) => this.lists.request(item, direction)
		);
	}
	renderInvitations(invitations) {
		const entries = [
			...invitations.incoming.map((item) => ({ direction: "incoming", item })),
			...invitations.outgoing.map((item) => ({ direction: "outgoing", item }))
		];
		this.lists.render(
			this.elements.invitations,
			entries,
			({ direction, item }) => this.lists.invitation(item, direction)
		);
	}
}

function offlineFriend(accountId) {
	return {
		accountId,
		displayName: accountId,
		online: false,
		status: "offline"
	};
}
