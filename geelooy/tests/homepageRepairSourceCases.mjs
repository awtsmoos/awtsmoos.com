// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests one whole hero, direct portal doors, and a profile sheet
 * whose fixed geometry belongs to the true viewport rather than a filtered header.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const readText = path => readFileSync(path, "utf8");
const homepage = readText("geelooy/index.html");
const profileCss = readText("geelooy/style/home-simple/profile-mount.css");
const shellCss = readText("geelooy/style/home-simple/navigation-shell.css");
const homeScript = readText("geelooy/scripts/home-simple/index.js");
const sharedProfile = readText("geelooy/scripts/awtsmoos/social/profileDropdown.js");
const sharedStyles = readText("geelooy/scripts/awtsmoos/social/profileDropdown/styles.js");
const ignoreRules = readText(".gitignore");
const historicalImage = readFileSync("geelooy/resources/home/dance-hero.jpg");
const deliveryImage = readFileSync("geelooy/resources/home/dance-hero-1024.jpg");

function readJpegDimensions(buffer) {
	let offset = 2;
	while (offset < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1;
			continue;
		}
		const marker = buffer[offset + 1];
		const length = buffer.readUInt16BE(offset + 2);
		if (marker >= 0xc0 && marker <= 0xc3) {
			return {
				height: buffer.readUInt16BE(offset + 5),
				width: buffer.readUInt16BE(offset + 7)
			};
		}
		offset += length + 2;
	}
	throw new Error("JPEG dimensions were not found");
}

function sectionBetween(start, end) {
	const startIndex = homepage.indexOf(start);
	const endIndex = homepage.indexOf(end, startIndex);
	assert.notEqual(startIndex, -1, `Missing section start: ${start}`);
	assert.notEqual(endIndex, -1, `Missing section end: ${end}`);
	return homepage.slice(startIndex, endIndex);
}

assert.equal((homepage.match(/class="hero-image"/g) ?? []).length, 1);
assert.equal(homepage.includes("hero-mosaic"), false);
assert.equal(homepage.includes("dance-hero-mosaic"), false);
assert.match(homepage, /dance-hero-1024\.jpg\?v=historical-1024/);
assert.deepEqual(readJpegDimensions(deliveryImage), { width: 1024, height: 1024 });
assert.ok(deliveryImage.length < 180000);
assert.equal(
	createHash("sha256").update(historicalImage).digest("hex"),
	"1e4b30ddb6237bf312b7368df549e6a332b8e30be6cbc679aa6cf9dc20d41612"
);

const shortcuts = sectionBetween('<nav class="portal-shortcuts"', "</nav>");
const dock = sectionBetween('<nav class="mobile-dock"', "</nav>");
for (const [world, route] of [["apps", "/apps"], ["games", "/games"], ["mail", "/email/"]]) {
	assert.match(shortcuts, new RegExp(`data-world-id="${world}" href="${route}"`));
	assert.match(dock, new RegExp(`data-world-id="${world}" href="${route}"`));
}

for (const path of ["geelooy/apps", "geelooy/games", "geelooy/email"]) {
	assert.equal(existsSync(path), true, `Missing direct route path: ${path}`);
}

assert.match(shellCss, /grid-template-areas: "brand signal worlds profile"/);
assert.match(shellCss, /grid-template-areas: "brand worlds profile"/);
assert.equal(shellCss.includes("backdrop-filter"), false);
assert.match(profileCss, /grid-area: profile/);
assert.match(profileCss, /width: 42px/);
assert.match(profileCss, /position: fixed !important/);
assert.match(profileCss, /overflow-y: auto !important/);
assert.match(profileCss, /data-awtsmoos-profile-open/);
assert.match(homeScript, /profileDropdown\.js\?v=5/);
assert.match(sharedProfile, /styles\.js\?v=5/);
assert.match(sharedStyles, /solid-005/);
assert.match(ignoreRules, /!geelooy\/resources\/home\/dance-hero-1024\.jpg/);
assert.match(homepage, /components\.css\?v=24/);
assert.match(homepage, /index\.js\?v=23/);

console.log('B"H homepage repair source cases passed');
