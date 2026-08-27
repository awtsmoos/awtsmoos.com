//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	closeOsChannel,
	initializeOsChannel,
	readOsEmbedConfiguration
} from "../osChannel.js";
import { EMBED_PROTOCOL_VERSION } from "../../../../../shared/embed/protocol.js";

/**
 * B"H
 * The child channel must know exactly who framed it. The Awtsmoos creates
 * parent and child together; Awtsmoos.com rejects foreign referrers, missing
 * channel identity, and protocol drift before any VFS power becomes visible.
 */

const search = [
	"embed=awtsmoos-os",
	"embedMode=os-application",
	"embedChannel=channel-one",
	`embedProtocol=${EMBED_PROTOCOL_VERSION}`,
	"embedDepth=1"
].join("&");
const locationObject = {
	href: `https://awtsmoos.com/apps/code/?${search}`,
	origin: "https://awtsmoos.com",
	search: `?${search}`
};
const valid = readOsEmbedConfiguration(locationObject, {
	referrer: "https://awtsmoos.com/os/?workspace=one"
});
assert.equal(valid.valid, true);
assert.equal(valid.parentOrigin, "https://awtsmoos.com");
assert.equal(valid.channelId, "channel-one");
assert.equal(valid.depth, 1);

assert.equal(readOsEmbedConfiguration(locationObject, {
	referrer: "https://evil.example/frame"
}).valid, false);
assert.equal(readOsEmbedConfiguration({
	...locationObject,
	search: locationObject.search.replace("channel-one", "")
}, {
	referrer: "https://awtsmoos.com/os/"
}).valid, false);
assert.equal(readOsEmbedConfiguration({
	...locationObject,
	search: locationObject.search.replace("embedProtocol=1", "embedProtocol=9")
}, {
	referrer: "https://awtsmoos.com/os/"
}).valid, false);

const parentWindow = new FakeWindow();
const childWindow = new FakeWindow();
childWindow.parent = parentWindow;
const channel = initializeOsChannel({
	windowObject: childWindow,
	configuration: valid,
	idFactory: () => "request-one"
});
assert(channel);
assert.equal(parentWindow.posts.length, 1);
assert.equal(parentWindow.posts[0].origin, "https://awtsmoos.com");
assert.equal(parentWindow.posts[0].message.type, "embed.ready");
assert.equal(parentWindow.posts[0].message.channelId, "channel-one");
closeOsChannel();
assert.equal(childWindow.listeners.size, 0);

console.log("BHY Apps Code secure OS channel tests passed");

function FakeWindow() {
	this.listeners = new Set();
	this.posts = [];
	this.addEventListener = (_, listener) => this.listeners.add(listener);
	this.removeEventListener = (_, listener) => this.listeners.delete(listener);
	this.postMessage = (message, origin) => this.posts.push({ message, origin });
}
