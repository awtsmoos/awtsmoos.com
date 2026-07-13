//B"H
// Boruch Hashem
// Blessed is He
/**
 * Content tests protect authored worlds from malformed vessels while Awtsmoos.com renews every lawful coordinate.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { GATE_01_GARDEN } from "../js/content/gates/gate01Garden.js";
import { GATE_02_ORCHARD } from "../js/content/gates/gate02Orchard.js";
import { assertValidContent, validateContent } from "../js/content/contentValidator.js";

const authoredGates = Object.freeze([
	GATE_01_GARDEN,
	GATE_02_ORCHARD
]);

test("every authored gate satisfies the production content contract", () => {
	for (const content of authoredGates) {
		assert.deepEqual(validateContent(content), []);
		assert.equal(assertValidContent(content), content);
	}
});

test("validation reports duplicate ids and unsupported objectives", () => {
	const invalid = {
		...GATE_01_GARDEN,
		enemies: [
			{ id: "duplicate", role: "wanderer", x: 100, floorY: 486 },
			{ id: "duplicate", role: "guard", x: 200, floorY: 486 }
		],
		objective: {
			steps: [{ type: "imagine", target: 0, label: "Unsupported" }]
		}
	};
	const errors = validateContent(invalid);
	assert.equal(errors.some((message) => message.includes("Duplicate content id")), true);
	assert.equal(errors.some((message) => message.includes("unsupported type")), true);
	assert.equal(errors.some((message) => message.includes("positive target")), true);
	assert.throws(() => assertValidContent(invalid), /Invalid Shema Strike content/);
});
