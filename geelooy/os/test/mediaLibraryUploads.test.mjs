//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { uploadToImgbb } from "../programs/media-library/imgbbUpload.js";
import { uploadMediaBatch } from "../programs/media-library/uploadBatch.js";

/** Proves the ImgBB adapter returns direct CDN and provider delete URLs. */
test("ImgBB upload returns direct and delete URLs", async function imgbbContract() {
	const file = new Blob(["image"], {
		type: "image/png"
	});
	Object.defineProperty(file, "name", {
		value: "light.png"
	});
	const result = await uploadToImgbb(file, "TEST_KEY", async function mockFetch(url, options) {
		assert.match(url, /api\.imgbb\.com\/1\/upload\?key=TEST_KEY/);
		assert.equal(options.method, "POST");
		assert.ok(options.body.get("image") instanceof Blob);
		return {
			ok: true,
			async json() {
				return {
					success: true,
					data: {
						url: "https://i.example/light.png",
						delete_url: "https://delete.example/light",
						width: 640,
						height: 480
					}
				};
			}
		};
	});

	assert.equal(result.url, "https://i.example/light.png");
	assert.equal(result.deleteUrl, "https://delete.example/light");
	assert.equal(result.provider, "imgbb");
});

/** Proves many files stay sequential and successful neighbors survive one failure. */
test("Media batch is sequential and preserves partial success", async function batchContract() {
	const files = [
		{ name: "one.png", type: "image/png", size: 1 },
		{ name: "two.png", type: "image/png", size: 2 },
		{ name: "three.png", type: "image/png", size: 3 }
	];
	let active = 0;
	let maximumActive = 0;
	const progress = [];
	const result = await uploadMediaBatch({
		files,
		provider: "mock",
		category: "Chassidus",
		onProgress(state) {
			progress.push(state.index);
		},
		async uploadImage(file) {
			active += 1;
			maximumActive = Math.max(maximumActive, active);
			await delay(2);
			active -= 1;
			if (file.name === "two.png") {
				throw new Error("fixture failure");
			}
			return {
				url: `https://cdn.example/${file.name}`,
				provider: "mock"
			};
		}
	});

	assert.equal(maximumActive, 1);
	assert.deepEqual(progress, [1, 2, 3]);
	assert.equal(result.records.length, 2);
	assert.equal(result.errors.length, 1);
	assert.equal(result.records[0].category, "Chassidus");
	assert.equal(result.errors[0].fileName, "two.png");
});

function delay(milliseconds) {
	return new Promise(function resolveLater(resolve) {
		setTimeout(resolve, milliseconds);
	});
}
