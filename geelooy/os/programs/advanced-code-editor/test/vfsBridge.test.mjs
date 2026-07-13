//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { createVfsBridge } from "../vfsBridge.js";
import { EMBED_KINDS } from "../../../../shared/embed/protocol.js";
import {
	FakeMessageWindow,
	testEmbedEnvelope
} from "../../../../shared/embed/test/fakes.mjs";

/**
 * B"H
 * This integration test stands at the actual iframe gate. The Awtsmoos creates
 * message, source, origin, VFS, and reply together; Awtsmoos.com proves that a
 * foreign witness receives no file power while the named channel remains live.
 */

const hostWindow = new FakeMessageWindow();
const childWindow = new FakeMessageWindow();
const iframe = {
	contentWindow: childWindow,
	src: "https://awtsmoos.com/apps/code/?embedChannel=channel-one"
};
const writes = [];
const rejected = [];
const dispose = createVfsBridge({
	os: createOs(writes),
	iframe,
	basePath: "/desktop.folder/project",
	initialFile: {
		fileName: "one.js",
		path: "/desktop.folder/project/one.js",
		content: "initial"
	},
	channelId: "channel-one",
	targetOrigin: "https://awtsmoos.com",
	listenWindow: hostWindow,
	onRejected: entry => rejected.push(entry)
});

await hostWindow.emit(message({}, "https://awtsmoos.com", readyEvent()));
await hostWindow.emit(message(childWindow, "https://evil.example", readyEvent()));
assert.deepEqual(rejected.map(entry => entry.reason), [
	"source-window-mismatch",
	"origin-mismatch"
]);
assert.equal(childWindow.posts.length, 0);

await hostWindow.emit(message(
	childWindow,
	"https://awtsmoos.com",
	readyEvent()
));
assert.deepEqual(childWindow.posts.map(post => post.message.type), [
	"embed.capabilities",
	"file.open"
]);
for (const post of childWindow.posts) {
	assert.equal(post.origin, "https://awtsmoos.com");
	assert.equal(post.message.channelId, "channel-one");
}

await hostWindow.emit(message(
	childWindow,
	"https://awtsmoos.com",
	testEmbedEnvelope({
		requestId: "request-one",
		kind: EMBED_KINDS.REQUEST,
		type: "vfs.write",
		source: "apps-code",
		target: "geelooy-os",
		payload: {
			fullPath: "desktop.folder/project/one.js",
			content: "updated"
		}
	})
));
assert.equal(writes.length, 1);
assert.equal(writes[0].path, "/desktop.folder/project/one.js");
assert.equal(writes[0].content, "updated");
assert.equal(writes[0].principal.userId, "code-embed:channel-one");
assert.equal(childWindow.posts.at(-1).message.kind, EMBED_KINDS.RESPONSE);
assert.equal(childWindow.posts.at(-1).message.ok, true);
dispose();
assert.equal(hostWindow.listenerCount(), 0);
console.log("BHY secure advanced editor VFS bridge tests passed");

function createOs(writes) {
	return {
		vfs: {
			async write(path, content, principal) {
				writes.push({ path, content, principal });
				return { path };
			}
		}
	};
}

function readyEvent() {
	return testEmbedEnvelope({
		type: "embed.ready",
		source: "apps-code",
		target: "geelooy-os"
	});
}

function message(source, origin, data) {
	return { source, origin, data };
}
