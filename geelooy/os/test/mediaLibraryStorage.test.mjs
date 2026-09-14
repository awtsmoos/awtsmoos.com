//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { mediaRecord, readImgbbKey, readMediaLibrary, saveImgbbKey, saveMediaLibrary } from "../programs/media-library/storage.js";

class BrowserStorageFixture {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

/** Proves provider metadata survives while File bytes and credentials stay separate. */
test("Media Library stores metadata without image bytes or ImgBB credentials", () => {
	const storage = new BrowserStorageFixture();
	const file = {
		name: "light.png",
		type: "image/png",
		size: 42,
		bytes: "PRIVATE_IMAGE_BYTES"
	};
	const record = mediaRecord({
		file,
		url: "https://cdn.example/light.png",
		provider: "imgbb",
		category: "Torah",
		deleteUrl: "https://delete.example/token",
		width: 1200,
		height: 800
	});
	saveImgbbKey("TEST_BROWSER_ONLY_KEY", storage);
	saveMediaLibrary([record], storage);
	const serialized = storage.getItem("awtsmoos-media-library-v1");

	assert.equal(record.deleteUrl, "https://delete.example/token");
	assert.equal(record.width, 1200);
	assert.equal(record.height, 800);
	assert.equal(readImgbbKey(storage), "TEST_BROWSER_ONLY_KEY");
	assert.doesNotMatch(serialized, /PRIVATE_IMAGE_BYTES/);
	assert.doesNotMatch(serialized, /TEST_BROWSER_ONLY_KEY/);
});

/** Proves the newest-first metadata vessel never grows beyond 300 records. */
test("Media Library metadata is bounded to 300 records", () => {
	const storage = new BrowserStorageFixture();
	const records = [];
	for (let index = 0; index < 305; index++) {
		records.push({
			id: `asset-${index}`,
			url: `https://cdn.example/${index}.png`
		});
	}
	const saved = saveMediaLibrary(records, storage);
	const read = readMediaLibrary(storage);

	assert.equal(saved.length, 300);
	assert.equal(read.length, 300);
	assert.equal(read[0].id, "asset-0");
	assert.equal(read[299].id, "asset-299");
});
