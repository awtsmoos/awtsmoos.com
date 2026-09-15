//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { readPostCompatible } = require("../seriesReadCompatibility.js");

/**
 * @file Narrow-first singular series post regressions.
 * @description The Awtsmoos lets Awtsmoos.com reveal one post through its smallest canonical child vessel before invoking the heavier historical reader.
 */
function context(get) {
	const calls = { gets: [], standard: 0 };
	return {
		calls,
		value: {
			$i: {
				db: {
					get: async (path, options) => {
						calls.gets.push({ path, options });
						return get(path, options);
					}
				}
			},
			heichelId: "ikar",
			seriesId: "bereishis",
			postId: "P1",
			properties: { title: true },
			standardReader: async () => {
				calls.standard++;
				return { id: "P1", title: "Legacy" };
			}
		}
	};
}

test("ordinary singular read returns narrow child without legacy reader", async () => {
	const fixture = context(path => path.endsWith("/posts/P1")
		? { id: "P1", title: "Narrow", content: "hidden by projection" }
		: null);
	const result = await readPostCompatible(fixture.value);
	assert.deepEqual(result, { id: "P1", title: "Narrow" });
	assert.equal(fixture.calls.standard, 0);
	assert.equal(fixture.calls.gets.length, 1);
	assert.match(fixture.calls.gets[0].path, /\/series\/bereishis\/posts\/P1$/u);
	assert.deepEqual(fixture.calls.gets[0].options, { max: true });
});

test("missing child and rich record fall back to legacy reader exactly once", async () => {
	const fixture = context(() => null);
	const result = await readPostCompatible(fixture.value);
	assert.deepEqual(result, { id: "P1", title: "Legacy" });
	assert.equal(fixture.calls.standard, 1);
	assert.equal(fixture.calls.gets.length, 2);
	assert.match(fixture.calls.gets[0].path, /\/series\/bereishis\/posts\/P1$/u);
	assert.equal(fixture.calls.gets[1].path, "/social/heichelos/ikar/posts/P1.awtsmoosJSON");
	assert.deepEqual(fixture.calls.gets[1].options, { max: true });
});
