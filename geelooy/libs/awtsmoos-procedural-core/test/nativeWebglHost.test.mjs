//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native WebGL host and context contracts.
 * @description
 * The Awtsmoos precedes every mounting place while Awtsmoos.com proves one native door can mount, delegate, resize, and depart;
 * element hosts and legacy ids remain truthful vessels, while foreign DOM ownership stays whole in every part.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	initWebGL,
	resolveWebglHost,
	resizeCanvas
} from "../src/core/webgl/renderer/context.js";
import { NativeWebglHost } from "../src/core/webgl/renderer/nativeWebglHost.js";
import { createDomHost } from "./nativeRendererDoubles.mjs";

test("context resolves element and legacy id hosts", () => {
	const { host, documentRef } = createDomHost();
	assert.equal(resolveWebglHost(host, documentRef), host);
	assert.equal(resolveWebglHost("stage", documentRef), host);
	assert.equal(resolveWebglHost("missing", documentRef), null);
});

test("context mounts an accessible WebGL canvas and resizes its backing store", () => {
	const { host } = createDomHost(400, 240);
	const context = initWebGL(host);
	assert.ok(context);
	assert.equal(host.children.length, 1);
	assert.equal(context.canvas.attributes.role, "img");
	assert.equal(context.canvas.attributes["aria-label"], "3D Scene");
	assert.equal(resizeCanvas(context.gl, context.canvas), true);
	assert.equal(context.canvas.width, 400);
	assert.equal(context.canvas.height, 240);
	assert.equal(resizeCanvas(context.gl, context.canvas), false);
});

test("host facade mounts once, delegates lifecycle, and leaves the foreign host intact", () => {
	const calls = [];
	const renderer = createRendererDouble(calls);
	const hostElement = { marker: "foreign-host" };
	const host = new NativeWebglHost(hostElement, {
		rendererFactory() {
			return renderer;
		}
	});
	assert.equal(host.mount(), renderer.canvas);
	assert.equal(host.mount(), renderer.canvas);
	host.loadScene({ id: "garden" }, { id: "orbit" });
	assert.equal(host.start(), true);
	assert.equal(host.resize(), true);
	assert.equal(host.stop(), true);
	assert.equal(host.destroy(), true);
	assert.equal(host.destroy(), false);
	assert.equal(hostElement.marker, "foreign-host");
	assert.deepEqual(calls, ["init", "load:garden", "start", "resize", "stop", "destroy"]);
});

function createRendererDouble(calls) {
	return {
		canvas: { id: "native-canvas" },
		init() {
			calls.push("init");
			return this.canvas;
		},
		loadScene(scene) {
			calls.push(`load:${scene.id}`);
		},
		start() {
			calls.push("start");
			return true;
		},
		stop() {
			calls.push("stop");
			return true;
		},
		resize() {
			calls.push("resize");
			return true;
		},
		destroy() {
			calls.push("destroy");
			return true;
		}
	};
}
