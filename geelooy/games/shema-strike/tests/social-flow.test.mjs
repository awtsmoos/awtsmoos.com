//B"H
// Boruch Hashem
// Blessed is He
/**
 * Browser social tests prove canonical refresh, action mapping, and DOM-free
 * composition. The Awtsmoos renews command and witness; Awtsmoos.com keeps
 * relationships server-authored and campaign tests independent of browser UI.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { NullSocialView } from "../js/social/NullSocialView.js";
import { SocialController } from "../js/social/SocialController.js";
import { SocialFlow } from "../js/social/SocialFlow.js";
import { SOCIAL_MESSAGES } from "../js/social/SocialProtocol.js";
import { SocialState } from "../js/social/SocialState.js";

function fakeView() {
	return {
		messages: [],
		renders: [],
		render(state) {
			this.renders.push(state);
		},
		setStatus(message) {
			this.messages.push(message);
		}
	};
}

function fakeSocket() {
	return {
		calls: [],
		listeners: [],
		onEvent(listener) {
			this.listeners.push(listener);
		},
		async request(type, payload) {
			this.calls.push({ payload, type });
			if (type === SOCIAL_MESSAGES.SNAPSHOT) {
				return {
					payload: {
						accountId: "account:aleph",
						blocks: [],
						invitations: { incoming: [], outgoing: [] },
						presence: [],
						relationships: { friends: [], incoming: [], outgoing: [] }
					}
				};
			}
			return { payload: { ok: true } };
		}
	};
}

test("friend mutation refreshes canonical social state", async () => {
	const socket = fakeSocket();
	const view = fakeView();
	const state = new SocialState(view);
	const flow = new SocialFlow(socket, state, view, () => "ABC234");
	await flow.friend("account:bet");
	assert.equal(socket.calls[0].type, SOCIAL_MESSAGES.FRIEND_REQUEST);
	assert.equal(socket.calls[1].type, SOCIAL_MESSAGES.SNAPSHOT);
	assert.equal(view.renders.at(-1).accountId, "account:aleph");
});

test("record actions map invitation and friendship identifiers correctly", async () => {
	const socket = fakeSocket();
	const flow = new SocialFlow(socket, new SocialState(fakeView()), fakeView(), () => "ABC234");
	await flow.record("accept-invite", "invite-1");
	assert.deepEqual(socket.calls[0], {
		payload: { invitationId: "invite-1" },
		type: SOCIAL_MESSAGES.INVITE_ACCEPT
	});
	await flow.record("cancel-friend", "request-1");
	assert.deepEqual(socket.calls[2], {
		payload: { requestId: "request-1" },
		type: SOCIAL_MESSAGES.FRIEND_CANCEL
	});
});

test("social controller composes without a DOM in isolated game tests", () => {
	const socket = fakeSocket();
	const game = {
		state: "menu",
		ui: {
			hideOverlays() {},
			showMenu() {}
		}
	};
	const controller = new SocialController(
		game,
		socket,
		() => "",
		new NullSocialView()
	);
	assert.ok(controller.flow);
	assert.equal(socket.listeners.length, 1);
});
