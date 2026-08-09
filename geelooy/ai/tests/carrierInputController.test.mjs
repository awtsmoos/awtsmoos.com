// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { CarrierInputController } from "../relay/direct/browser/CarrierInputController.mjs";

function readerReply(method, composerText) {
	if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
	if (method === "DOM.querySelector") return { nodeId: 17 };
	if (method === "DOM.resolveNode") return { object: { objectId: "composer" } };
	if (method === "Runtime.callFunctionOn") {
		return { result: { value: composerText() } };
	}
	if (method === "Runtime.releaseObject") return {};
	return null;
}

test("composer click fallback still keyboard-activates Send", async () => {
	const methods = [];
	let focusAttempts = 0;
	let composerText = "";
	const client = {
		async send(method, params = {}) {
			methods.push(method);
			if (method === "DOM.focus" && focusAttempts++ < 2) {
				throw new Error("Element is not focusable");
			}
			if (method === "Input.insertText") composerText = params.text;
			const reply = readerReply(method, () => composerText);
			if (reply) return reply;
			if (method === "DOM.getBoxModel") {
				return { model: { content: [0, 0, 100, 0, 100, 40, 0, 40] } };
			}
			return {};
		}
	};
	const controller = new CarrierInputController(client, {
		sleep: async () => undefined,
		selectionModifier: 4
	});
	await controller.focusAndReplace({ nodeId: 7, selector: "#prompt-textarea" }, "exact prompt");
	await controller.activateNode({ nodeId: 9 });
	assert(methods.includes("Input.insertText"));
	assert.equal(methods.filter(method => method === "Input.dispatchMouseEvent").length, 0);
	assert(methods.includes("Input.dispatchKeyEvent"));
	assert.equal(methods.filter(method => method === "DOM.focus").length, 4);
	assert(methods.includes("DOM.querySelector"));
});

test("character fallback clears partial input before exact prompt", async () => {
	let composerText = "old text";
	let insertions = 0;
	let backspaces = 0;
	const client = {
		async send(method, params = {}) {
			if (method === "DOM.focus") return {};
			if (method === "Input.insertText") {
				insertions += 1;
				composerText += "partial";
				return {};
			}
			const reply = readerReply(method, () => composerText);
			if (reply) return reply;
			if (method === "Input.dispatchKeyEvent" && params.type === "keyDown" &&
				params.key === "Backspace") {
				backspaces += 1;
				composerText = "";
			}
			if (method === "Input.dispatchKeyEvent" && params.type === "char") {
				composerText += params.text;
			}
			return {};
		}
	};
	const controller = new CarrierInputController(client, {
		sleep: async () => undefined,
		selectionModifier: 4
	});
	await controller.focusAndReplace({ nodeId: 7, selector: "#prompt-textarea" }, "exact prompt");
	assert.equal(insertions, 1);
	assert.equal(backspaces, 2);
	assert.equal(composerText, "exact prompt");
});

test("stale Send geometry renews and submits one pointer gesture", async () => {
	const methods = [];
	let boxes = 0;
	const client = {
		async send(method) {
			methods.push(method);
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelector") return { nodeId: 21 };
			if (method === "DOM.focus") throw new Error("Node with given id was unavailable");
			if (method === "DOM.getBoxModel") {
				boxes += 1;
				if (boxes === 1) throw new Error("Could not compute box model.");
				return { model: { content: [0, 0, 100, 0, 100, 40, 0, 40] } };
			}
			return {};
		}
	};
	const controller = new CarrierInputController(client, { sleep: async () => undefined });
	await controller.activateNode({ nodeId: 9, selector: "button[data-testid='send-button']" });
	assert.equal(boxes, 2);
	assert.equal(methods.filter(method => method === "Input.dispatchMouseEvent").length, 2);
	assert.equal(methods.filter(method => method === "Input.dispatchKeyEvent").length, 0);
});
