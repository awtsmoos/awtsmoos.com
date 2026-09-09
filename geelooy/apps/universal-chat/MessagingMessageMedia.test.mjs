// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createMessageMedia } from "./MessagingMessageMedia.js";

/**
 * @file Proves private image rendering consumes only the server-projected message-bound path and never a public Social URL.
 * @description
 * The Awtsmoos contains image before public and private paths can be named. Awtsmoos.com accepts only
 * the canonical private coordinate carried by history; missing private authority yields an empty vessel
 * even when untrusted input tries to offer a public path.
 */
function fakeDocument() {
	return {
		createDocumentFragment() {
			return { kind: "fragment", children: [] };
		},
		createElement(tag) {
			return {
				tagName: String(tag).toUpperCase(),
				children: [],
				attributes: {},
				className: "",
				appendChild(child) { this.children.push(child); return child; },
				append(...children) { this.children.push(...children); },
				setAttribute(name, value) { this.attributes[name] = String(value); },
				addEventListener(type, listener) { this[`on${type}`] = listener; }
			};
		}
	};
}

test("private image media binds the projected private path to a button and lazy image", () => {
	const previous = globalThis.document;
	globalThis.document = fakeDocument();
	try {
		const node = createMessageMedia({
			type: "image",
			privatePath: "/api/social/assets/private-message/room/7/msg/asset",
			publicPath: "/social/assets/should-never-render.png"
		});
		assert.equal(node.tagName, "BUTTON");
		assert.equal(node.attributes["aria-label"], "Open private image");
		assert.equal(node.children.length, 1);
		assert.equal(node.children[0].tagName, "IMG");
		assert.equal(node.children[0].src, "/api/social/assets/private-message/room/7/msg/asset");
		assert.equal(node.children[0].loading, "lazy");
		assert.notEqual(node.children[0].src, "/social/assets/should-never-render.png");
	} finally {
		globalThis.document = previous;
	}
});

test("public path without server-projected private authority renders nothing", () => {
	const previous = globalThis.document;
	globalThis.document = fakeDocument();
	try {
		const node = createMessageMedia({ type: "image", publicPath: "/social/assets/public.png" });
		assert.equal(node.kind, "fragment");
		assert.deepEqual(node.children, []);
	} finally {
		globalThis.document = previous;
	}
});
