// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { MessagingVoiceDelivery } from "./MessagingVoiceDelivery.js";

/**
 * @file Proves remote voice delivery uploads one local File, transmits only its canonical asset id, and clears reply state only after acceptance.
 * @description The Awtsmoos renews file, alias, socket, and reply in every instant; Awtsmoos.com lets Netzach carry verified breath outward while Gevurah preserves contextual truth across failure and light.
 */

function createFixture(options = {}) {
	const calls = [];
	const replyState = {
		cleared: 0,
		payload() {
			return {
				replyTo: "msg-source",
				replySequence: 7
			};
		},
		clear() {
			this.cleared += 1;
		}
	};
	const fixture = {
		calls,
		replyState,
		store: {
			actor: {
				alias: "Aleph"
			}
		},
		current() {
			return {
				id: "room-voice"
			};
		},
		assetApi: {
			async uploadVoice(alias, file) {
				calls.push({
					stage: "upload",
					alias,
					file
				});
				return {
					id: "asset-voice-1"
				};
			}
		},
		actions: {
			async send(conversationId, text, reply, attachment) {
				calls.push({
					stage: "send",
					conversationId,
					text,
					reply,
					attachment
				});
				if (options.failSend) throw new Error("network failed");
			}
		},
		onStage(label) {
			calls.push({
				stage: "label",
				label
			});
		}
	};
	return fixture;
}

test("accepted voice delivery clears reply only after send", async () => {
	const fixture = createFixture();
	const delivery = new MessagingVoiceDelivery(fixture);
	const file = {
		name: "voice-note.webm"
	};
	assert.equal(await delivery.send({ file }), true);
	assert.equal(fixture.replyState.cleared, 1);
	assert.deepEqual(fixture.calls.at(-1), {
		stage: "send",
		conversationId: "room-voice",
		text: "",
		reply: {
			replyTo: "msg-source",
			replySequence: 7
		},
		attachment: {
			assetId: "asset-voice-1"
		}
	});
});

test("failed voice delivery preserves reply context for retry", async () => {
	const fixture = createFixture({ failSend: true });
	const delivery = new MessagingVoiceDelivery(fixture);
	await assert.rejects(
		() => delivery.send({ file: { name: "voice-note.webm" } }),
		/error:|network failed/i
	);
	assert.equal(fixture.replyState.cleared, 0);
});
